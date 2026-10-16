import type { IdentityRepository } from './identity.js';
import type { MemberRepository } from './member.js';
export interface MemberUnitOfWork {
  readonly persistence:'memory'|'postgresql';
  run<T>(work:(identity:IdentityRepository,members:MemberRepository)=>Promise<T>):Promise<T>;
}
