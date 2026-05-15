import type { CreateUserRequestDto as CreateUserRequest } from "../../../types/user.dto";
import type {
  CreateUserPayload,
  UserRepository,
} from "../../repositories/user.repository.interface";

export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(uid: string, data: CreateUserRequest): Promise<void> {
    const payload: CreateUserPayload = {
      uid,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    await this.repository.createUser(payload);
  }
}
