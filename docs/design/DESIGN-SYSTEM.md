# Design System V1

Status: Draft.

## Principles

Calm desktop density, clear object hierarchy, evidence before automation, visible permission scope, reversible actions, keyboard-first operation, and consistent failure states.

## Tokens to freeze

- Color roles: canvas, surface, elevated, text, muted, border, focus, success, warning, danger, approval, running, paused, failed.
- Typography roles: display, page title, section title, body, label, code, metadata.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48.
- Radius, elevation, focus ring, motion duration, and minimum hit target.

## Shared components

AppShell, Sidebar, Breadcrumbs, ObjectHeader, StatusBadge, EvidenceList, PermissionNotice, ApprovalCard, AgentRunTimeline, TaskRow, ArtifactCard, EmptyState, ErrorState, OfflineBanner, ConfirmDialog, CommandPalette, DataTable, InspectorPanel, Toast, and SidecarHealthCard.

Each component must expose documented states and remain independent of provider SDKs and runtime framework types.
