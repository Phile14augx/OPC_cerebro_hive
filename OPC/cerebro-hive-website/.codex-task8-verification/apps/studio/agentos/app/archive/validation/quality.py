"""Knowledge Quality Engine — Knowledge Health Index (KHI)."""

from app.archive.models import Node

def calculate_khi(node: Node) -> float:
    """
    Calculate the Knowledge Health Index (0.0 to 100.0)
    KHI is a weighted average of multiple dimensions.
    """
    # Simulated metadata reads
    freshness = 90.0
    authority = 85.0
    trust = 100.0 if node.status == "Approved" else 50.0
    coverage = 70.0
    connectivity = len(node.outgoing_edges) * 10.0
    usage = 80.0
    conflict_count = 0.0
    version_stability = 95.0
    embedding_quality = 88.0
    lineage_score = 100.0 if node.provenance else 0.0
    
    # Simple unweighted average for now
    scores = [
        freshness, authority, trust, coverage, connectivity,
        usage, (100 - conflict_count * 10), version_stability,
        embedding_quality, lineage_score
    ]
    
    khi = sum(scores) / len(scores)
    return min(100.0, max(0.0, khi))
