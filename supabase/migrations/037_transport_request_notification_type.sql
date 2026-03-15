-- Migration 037: Add transport_request notification type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'transport_request';
