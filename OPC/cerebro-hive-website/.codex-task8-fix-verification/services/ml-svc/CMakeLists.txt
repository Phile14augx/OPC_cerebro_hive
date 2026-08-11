cmake_minimum_required(VERSION 3.25)
project(cerebro_ml_svc VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type")

# Compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-O3 -march=native -Wall -Wextra -Wpedantic -ffast-math)
endif()

# ── Dependencies via FetchContent ─────────────────────────────────────────────
include(FetchContent)

# gRPC + Protobuf
find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED)

# Eigen (header-only, linear algebra for vector ops)
FetchContent_Declare(eigen
    GIT_REPOSITORY https://gitlab.com/libeigen/eigen.git
    GIT_TAG 3.4.0
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(eigen)

# libpqxx (PostgreSQL C++ client for pgvector queries)
find_package(libpqxx QUIET)
if(NOT libpqxx_FOUND)
    FetchContent_Declare(libpqxx
        GIT_REPOSITORY https://github.com/jtv/libpqxx.git
        GIT_TAG 7.9.2
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(libpqxx)
endif()

# spdlog (structured logging)
FetchContent_Declare(spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG v1.14.1
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(spdlog)

# nlohmann/json
FetchContent_Declare(json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(json)

# hiredis (Redis client)
find_package(hiredis QUIET)

# ── Protobuf codegen ──────────────────────────────────────────────────────────
set(PROTO_DIR "${CMAKE_SOURCE_DIR}/../../proto")
set(PROTO_GEN "${CMAKE_BINARY_DIR}/proto_gen")
file(MAKE_DIRECTORY ${PROTO_GEN})

set(PROTO_FILES
    "${PROTO_DIR}/ml.proto"
    "${PROTO_DIR}/auth.proto"
)

protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ${PROTO_GEN} ${PROTO_FILES})
grpc_generate_cpp(GRPC_SRCS GRPC_HDRS ${PROTO_GEN} ${PROTO_FILES})

# ── Sources ───────────────────────────────────────────────────────────────────
set(SOURCES
    src/main.cpp
    src/grpc/ml_service_impl.cpp
    src/core/vector_index.cpp
    src/core/embedding_engine.cpp
    src/core/lead_scorer.cpp
    src/core/recommender.cpp
    src/core/pgvector_client.cpp
    ${PROTO_SRCS}
    ${GRPC_SRCS}
)

add_executable(ml_svc ${SOURCES})

target_include_directories(ml_svc PRIVATE
    ${CMAKE_SOURCE_DIR}/include
    ${CMAKE_SOURCE_DIR}/src
    ${PROTO_GEN}
    ${eigen_SOURCE_DIR}
)

target_link_libraries(ml_svc PRIVATE
    gRPC::grpc++
    protobuf::libprotobuf
    pqxx
    spdlog::spdlog
    nlohmann_json::nlohmann_json
    pthread
)

if(hiredis_FOUND)
    target_link_libraries(ml_svc PRIVATE hiredis::hiredis)
    target_compile_definitions(ml_svc PRIVATE CEREBRO_REDIS_ENABLED)
endif()

# Tests
option(BUILD_TESTS "Build unit tests" ON)
if(BUILD_TESTS)
    enable_testing()
    FetchContent_Declare(googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.15.2
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(googletest)
    add_subdirectory(tests)
endif()

install(TARGETS ml_svc RUNTIME DESTINATION bin)
