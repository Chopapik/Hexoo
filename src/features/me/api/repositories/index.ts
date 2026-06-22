import { AccountDeletionSupabaseRepository } from "./account-deletion.supabase.repository";

export const accountDeletionRepository =
  new AccountDeletionSupabaseRepository();

export type {
  AccountDeletionJob,
  AccountDeletionRepository,
  AccountDeletionStep,
} from "./account-deletion.repository.interface";
