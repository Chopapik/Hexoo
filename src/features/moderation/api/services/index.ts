import { ModerationService } from "./moderation.service";
import { ModerationEnricher } from "./moderation.enricher";
import {
  GetModerationQueueForPostsUseCase,
  GetModerationQueueForCommentsUseCase,
} from "./use-cases";

const moderationEnricher = new ModerationEnricher();

export const getModerationService = (): ModerationService => {
  const getModerationQueueForPostsUseCase = new GetModerationQueueForPostsUseCase(
    moderationEnricher,
  );

  const getModerationQueueForCommentsUseCase =
    new GetModerationQueueForCommentsUseCase(moderationEnricher);

  return new ModerationService(
    getModerationQueueForPostsUseCase,
    getModerationQueueForCommentsUseCase,
  );
};

export { ModerationService };
