"""Conflict Resolution Engine — Authority Matrix and heuristics."""

from typing import Any
from app.archive.models import Node

class AuthorityMatrix:
    """Enterprise Authority Matrix for conflict resolution."""
    
    # Weightings for various factors (0.0 to 1.0)
    WEIGHT_DEPARTMENT = 0.3
    WEIGHT_ROLE = 0.2
    WEIGHT_FRESHNESS = 0.15
    WEIGHT_CONFIDENCE = 0.15
    WEIGHT_TRUST = 0.2

    # Simulated departmental authority mapping per domain
    # In reality, this would be loaded from the Ontology Registry or Policy SDK
    DOMAIN_AUTHORITY = {
        "hr_policy": {"HR": 1.0, "Legal": 0.9, "Engineering": 0.1},
        "remote_work": {"HR": 0.8, "Legal": 1.0, "Engineering": 0.2},
        "security": {"Security": 1.0, "IT": 0.9, "HR": 0.3}
    }

def resolve_conflict(node_a: Node, node_b: Node, domain: str) -> Node:
    """
    Resolve a knowledge conflict using the Authority Matrix.
    Returns the winning Node.
    """
    score_a = _calculate_authority_score(node_a, domain)
    score_b = _calculate_authority_score(node_b, domain)
    
    return node_a if score_a >= score_b else node_b

def _calculate_authority_score(node: Node, domain: str) -> float:
    matrix = AuthorityMatrix()
    
    # Extract metadata (simulated)
    dept = node.meta.get("department", "Unknown")
    role = node.meta.get("author_role", "Employee")
    
    # 1. Departmental Authority
    dept_score = matrix.DOMAIN_AUTHORITY.get(domain, {}).get(dept, 0.5)
    
    # 2. Role Authority
    role_score = 1.0 if role in ("C-Level", "VP") else 0.8 if role == "Director" else 0.5
    
    # 3. Freshness
    freshness_score = 1.0 # Simplified
    
    # 4. Confidence
    confidence_score = node.confidence
    
    # 5. Trust (Approval level)
    trust_score = 1.0 if node.status == "Approved" else 0.5
    
    # Weighted Average
    final_score = (
        (dept_score * matrix.WEIGHT_DEPARTMENT) +
        (role_score * matrix.WEIGHT_ROLE) +
        (freshness_score * matrix.WEIGHT_FRESHNESS) +
        (confidence_score * matrix.WEIGHT_CONFIDENCE) +
        (trust_score * matrix.WEIGHT_TRUST)
    )
    return final_score
