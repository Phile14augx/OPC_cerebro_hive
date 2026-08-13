# CerebroHive Enterprise Intelligence Operating System (EIOS)

This repository contains the CerebroHive EIOS platform codebase, previously known as Cerebro Studio.

## Architecture & Governance

CerebroHive is built on a 10-Layer Enterprise Intelligence Operating System (EIOS) architecture. The vision drives the architecture, the architecture drives the implementation, and the implementation drives the products.

**Start Here:**
1. [EIOS Manifesto](architecture/manifesto/CEREBROHIVE_EIOS_MANIFESTO.md)
2. [Architecture Taxonomy Index](architecture/ARCHITECTURE_INDEX.md)
3. [EIOS Constitution](CEREBROHIVE_CONSTITUTION.md)

## Configuration

Studio requires the `NEXT_PUBLIC_API_URL` environment variable to be set to point to the live Engineering Review API endpoints.
Please copy `apps/studio/.env.example` to `apps/studio/.env.local` to configure your environment.

See ADRs in the architecture governance documents for more details.
