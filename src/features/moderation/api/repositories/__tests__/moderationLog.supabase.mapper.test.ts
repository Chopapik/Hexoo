import { describe, expect, it } from "vitest";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { ModerationLogPayload } from "../moderationLog.repository.interface";
import {
  mapModerationLogRow,
  toModerationContext,
  toModerationLogInsertRow,
} from "../moderationLog.supabase.mapper";

type ModerationLogRow = Parameters<typeof mapModerationLogRow>[0];

const evidence: NonNullable<ModerationLogPayload["evidence"]> = [
  {
    category: "violence",
    score: 0.87,
    sources: ["text", "image"],
  },
  {
    category: "self-harm",
    score: 0.63,
    sources: ["image"],
  },
];

function moderationLogRow(
  overrides: Partial<ModerationLogRow> = {},
): ModerationLogRow {
  return {
    id: "mod-log-row-1",
    user_id: "subject-user-row-1",
    actor_id: "moderator-row-1",
    resource_id: "post-row-1",
    resource_type: "post",
    verdict: ModerationStatus.Approved,
    categories: ["sexual", "violence"],
    action_taken: "BLOCKED_CREATION",
    previous_status: "visible",
    new_status: "pending",
    source: "user_report",
    reason_summary: "Stored row summary",
    reason_details: JSON.stringify({
      summary: "Stored row details",
      evidence,
    }),
    timestamp: "2026-07-06T08:09:10.000Z",
    created_at: "2026-07-06T08:10:11.000Z",
    ...overrides,
  };
}

describe("moderationLog.supabase.mapper", () => {
  describe("toModerationLogInsertRow", () => {
    it("maps a domain moderation log payload to a Supabase insert row", () => {
      const row = toModerationLogInsertRow({
        userId: "subject-user-insert-1",
        actorId: "moderator-insert-1",
        resourceId: "comment-insert-1",
        resourceType: "comment",
        verdict: ModerationStatus.Rejected,
        categories: ["hate", "harassment"],
        actionTaken: "CONTENT_REMOVED",
        source: "moderator",
        previousStatus: "pending",
        newStatus: "rejected",
        reasonSummary: "Insert reason summary",
        reasonDetails: "Insert provider details",
        timestamp: new Date("2026-07-06T09:10:11.000Z"),
        evidence,
      });

      expect(row).toMatchObject({
        user_id: "subject-user-insert-1",
        actor_id: "moderator-insert-1",
        resource_id: "comment-insert-1",
        resource_type: "comment",
        verdict: ModerationStatus.Rejected,
        categories: ["hate", "harassment"],
        action_taken: "CONTENT_REMOVED",
        source: "moderator",
        previous_status: "pending",
        new_status: "rejected",
        reason_summary: "Insert reason summary",
        timestamp: "2026-07-06T09:10:11.000Z",
      });
      expect(JSON.parse(row.reason_details ?? "{}")).toEqual({
        summary: "Insert provider details",
        evidence,
      });
    });

    it("preserves legacy plain reason details when no evidence is present", () => {
      const row = toModerationLogInsertRow({
        userId: "subject-user-insert-2",
        verdict: ModerationStatus.Pending,
        categories: ["spam"],
        actionTaken: "FLAGGED_FOR_REVIEW",
        resourceType: "post",
        resourceId: "post-insert-2",
        source: "ai",
        reasonDetails: "Legacy provider text",
      });

      expect(row.reason_details).toBe("Legacy provider text");
      expect(row.actor_id).toBeNull();
      expect(row.previous_status).toBeNull();
      expect(row.new_status).toBeNull();
    });
  });

  describe("mapModerationLogRow", () => {
    it("maps a full Supabase row back to the domain moderation log payload", () => {
      expect(mapModerationLogRow(moderationLogRow())).toEqual({
        userId: "subject-user-row-1",
        actorId: "moderator-row-1",
        resourceId: "post-row-1",
        resourceType: "post",
        verdict: ModerationStatus.Approved,
        categories: ["sexual", "violence"],
        actionTaken: "BLOCKED_CREATION",
        previousStatus: "visible",
        newStatus: "pending",
        source: "user_report",
        reasonSummary: "Stored row summary",
        reasonDetails: "Stored row details",
        timestamp: new Date("2026-07-06T08:09:10.000Z"),
        evidence,
      });
    });

    it("decodes legacy plain and malformed reason details as summary text", () => {
      expect(
        mapModerationLogRow(
          moderationLogRow({
            reason_details: "Legacy plain moderation details",
          }),
        ),
      ).toMatchObject({
        reasonDetails: "Legacy plain moderation details",
        evidence: undefined,
      });

      expect(
        mapModerationLogRow(
          moderationLogRow({
            reason_details: "{not-json",
          }),
        ),
      ).toMatchObject({
        reasonDetails: "{not-json",
        evidence: undefined,
      });
    });

    it("applies current fallbacks for unknown and nullable DB fields", () => {
      const payload = mapModerationLogRow(
        moderationLogRow({
          verdict: "unknown-verdict",
          action_taken: "UNKNOWN_ACTION",
          resource_type: "profile",
          resource_id: null,
          source: "provider",
          actor_id: null,
          reason_summary: null,
          reason_details: null,
          previous_status: null,
          new_status: null,
          categories: [],
        }),
      );

      expect(payload).toMatchObject({
        verdict: ModerationStatus.Pending,
        actionTaken: "FLAGGED_FOR_REVIEW",
        categories: [],
      });
      expect(payload.resourceType).toBeUndefined();
      expect(payload.resourceId).toBeUndefined();
      expect(payload.source).toBeUndefined();
      expect(payload.actorId).toBeUndefined();
      expect(payload.reasonSummary).toBeUndefined();
      expect(payload.reasonDetails).toBeUndefined();
      expect(payload.evidence).toBeUndefined();
      expect(payload.previousStatus).toBeUndefined();
      expect(payload.newStatus).toBeUndefined();
    });
  });

  describe("toModerationContext", () => {
    it("serializes moderation context with evidence and explicit null fields", () => {
      expect(
        toModerationContext({
          userId: "context-user-1",
          timestamp: new Date("2026-07-06T10:11:12.000Z"),
          verdict: ModerationStatus.Rejected,
          categories: ["self-harm"],
          actionTaken: "BLOCKED_CREATION",
          reasonSummary: "Context summary",
          evidence,
        }),
      ).toEqual({
        timestamp: "2026-07-06T10:11:12.000Z",
        verdict: ModerationStatus.Rejected,
        categories: ["self-harm"],
        actionTaken: "BLOCKED_CREATION",
        source: null,
        actorId: null,
        reasonSummary: "Context summary",
        reasonDetails: null,
        evidence,
      });
    });

    it("serializes missing moderation context to null", () => {
      expect(toModerationContext(null)).toBeNull();
      expect(toModerationContext(undefined)).toBeNull();
    });
  });
});
