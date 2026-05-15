import type { UserEntity } from "../../../types/user.entity";
import type { UserRepository } from "../../repositories/user.repository.interface";

export class GetUserByUidUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(uid: string): Promise<UserEntity | null> {
    return await this.repository.getUserByUid(uid);
  }
}
