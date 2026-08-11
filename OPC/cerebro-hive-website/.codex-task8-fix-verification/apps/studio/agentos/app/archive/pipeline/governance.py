"""Knowledge Governance — Validates trust scores, lifecycle states, and permissions."""

from app.archive.models import Node, Edge
from datetime import datetime, timezone

def is_knowledge_approved(node: Node) -> bool:
    """
    Check if a node is valid, approved, and currently active.
    This enforces the World Model's trust and temporal bounds.
    """
    now = datetime.now(timezone.utc)
    
    # 1. Lifecycle State
    if node.status not in ("Validated", "Approved"):
        return False
        
    # 2. Temporal Validity
    if node.valid_from and node.valid_from > now:
        return False
    if node.valid_until and node.valid_until < now:
        return False
        
    # 3. Confidence Threshold
    if node.confidence < 0.5:
        return False
        
    return True

def can_user_access_node(node: Node, user_context: dict) -> bool:
    """Check if the current user has permission to access this node."""
    # Delegate to Identity SDK Policy Engine (OPA)
    from app.core.sdk.platform import platform
    return platform.identity.check_permission("read", f"node:{node.id}")
