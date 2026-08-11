#include "ml_service_impl.hpp"
#include "embedding_engine.hpp"
#include "lead_scorer.hpp"
#include "recommender.hpp"
#include "pgvector_client.hpp"
#include "vector_index.hpp"

#include <grpcpp/grpcpp.h>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>

#include <csignal>
#include <cstdlib>
#include <memory>
#include <string>
#include <atomic>
#include <thread>
#include <chrono>

// ── Globals ───────────────────────────────────────────────────────────────────

static std::atomic<bool> g_shutdown{false};
static std::unique_ptr<grpc::Server> g_server;

static void signal_handler(int) {
    g_shutdown.store(true);
    if (g_server) g_server->Shutdown();
}

// ── Config from env ───────────────────────────────────────────────────────────

static std::string env(const char* key, const char* dflt = "") {
    const char* v = std::getenv(key);
    return v ? v : dflt;
}

// ── Health probe thread ───────────────────────────────────────────────────────
// gRPC reflection + liveness endpoint on a separate plain TCP port
// Real k8s liveness: kubectl exec → grpc_health_probe binary

// ── Main ──────────────────────────────────────────────────────────────────────

int main() {
    // ── Logging ─────────────────────────────────────────────────────────────
    auto logger = spdlog::stdout_color_mt("ml-svc");
    spdlog::set_default_logger(logger);

    const std::string log_level = env("LOG_LEVEL", "info");
    if      (log_level == "debug") spdlog::set_level(spdlog::level::debug);
    else if (log_level == "warn")  spdlog::set_level(spdlog::level::warn);
    else                           spdlog::set_level(spdlog::level::info);

    spdlog::info("Starting CerebroHive ML service");

    // ── Config ───────────────────────────────────────────────────────────────
    const std::string db_url   = env("DATABASE_URL",
        "postgresql://cerebro:cerebro@localhost:5433/cerebro");
    const std::string grpc_addr = env("GRPC_ADDR", "0.0.0.0:50051");
    const std::size_t embed_dims = 384; // MINI_LM default

    // ── Dependency construction ───────────────────────────────────────────────
    spdlog::info("Connecting to PostgreSQL…");
    auto pg = std::make_shared<cerebro::ml::PgVectorClient>(db_url);

    try {
        pg->ensure_schema(embed_dims);
        spdlog::info("pgvector schema ready");
    } catch (const std::exception& e) {
        spdlog::warn("pgvector schema init failed (non-fatal): {}", e.what());
    }

    auto emb        = std::make_shared<cerebro::ml::EmbeddingEngine>();
    auto scorer     = std::make_shared<cerebro::ml::LeadScorer>();

    // Shared item embeddings index (COSINE, 384-d)
    auto& item_index = cerebro::ml::IndexRegistry::instance()
                           .get_or_create("items", embed_dims, cerebro::ml::DistanceMetric::COSINE);
    auto recommender = std::make_shared<cerebro::ml::Recommender>(item_index, embed_dims);

    // ── gRPC server ───────────────────────────────────────────────────────────
    cerebro::ml::MlServiceImpl service_impl(pg, emb, scorer, recommender);

    grpc::ServerBuilder builder;
    builder.AddListeningPort(grpc_addr, grpc::InsecureServerCredentials());
    builder.RegisterService(&service_impl);

    // Max message sizes: 50 MB (batch embeddings)
    builder.SetMaxReceiveMessageSize(50 * 1024 * 1024);
    builder.SetMaxSendMessageSize(50 * 1024 * 1024);

    // Thread pool sized to CPU count × 2
    unsigned int threads = std::max(2u, std::thread::hardware_concurrency() * 2);
    builder.SetSyncServerOption(grpc::ServerBuilder::SyncServerOption::NUM_CQS, threads);

    g_server = builder.BuildAndStart();
    if (!g_server) {
        spdlog::critical("Failed to start gRPC server on {}", grpc_addr);
        return 1;
    }
    spdlog::info("ML service listening on {} ({} threads)", grpc_addr, threads);

    // ── Signal handling ───────────────────────────────────────────────────────
    std::signal(SIGTERM, signal_handler);
    std::signal(SIGINT,  signal_handler);

    g_server->Wait();
    spdlog::info("ML service shut down cleanly");
    return 0;
}
