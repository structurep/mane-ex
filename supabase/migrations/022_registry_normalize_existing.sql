-- Migration 022: Normalize existing registry values to uppercase/trimmed
UPDATE listing_registry_records SET registry = UPPER(TRIM(registry));
