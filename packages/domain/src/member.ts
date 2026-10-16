import type { Preferences, PreferencesPatch,ListeningState,ListeningProgress } from '../../contracts/src/member.js';
import { preferencesPatchSchema, articleIdSchema } from '../../contracts/src/member.js';
import { AccessError, IdentityService, type AuthContext, type Clock } from './identity.js';
import { publicProjection, type PublicationRepository } from './publication.js';
import type { Interests,InterestsPatch } from '../../contracts/src/interests.js';

export interface Bookmark {userId:string;articleId:string;savedVersionId:string;createdAt:string;}
export interface MemberRepository {
  interests?(userId:string):Promise<Interests>;
  updateInterests?(userId:string,patch:InterestsPatch):Promise<Interests>;
  preferences(userId:string):Promise<Preferences>;
  updatePreferences(userId:string,patch:PreferencesPatch,now:string):Promise<Preferences>;
  bookmarks(userId:string):Promise<Bookmark[]>;
  addBookmark(bookmark:Bookmark):Promise<Bookmark>;
  removeBookmark(userId:string,articleId:string):Promise<void>;
  listening?(userId:string):Promise<ListeningState>;
  updateQueue?(userId:string,revision:number,programmeIds:string[]):Promise<ListeningState>;
  updateProgress?(userId:string,progress:Omit<ListeningProgress,'updatedAt'>):Promise<ListeningProgress>;
  clearProgress?(userId:string):Promise<void>;
}
export class MemberService {
  constructor(private identity:IdentityService,private repo:MemberRepository,private articles:PublicationRepository,private clock:Clock=Date.now){}
  async preferences(context:AuthContext){await this.identity.authorize(context,'preferences:read');return this.repo.preferences(context.userId);}
  async updatePreferences(context:AuthContext,input:unknown){
    await this.identity.authorize(context,'preferences:write');const parsed=preferencesPatchSchema.safeParse(input);
    if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
    return this.repo.updatePreferences(context.userId,parsed.data,new Date(this.clock()).toISOString());
  }
  private article(id:string){return this.articles.list().map(d=>publicProjection(d,'brief')).find(a=>a?.id===id);}
  async bookmarks(context:AuthContext){
    await this.identity.authorize(context,'bookmarks:read');
    return (await this.repo.bookmarks(context.userId)).map(b=>{
      if(b.userId!==context.userId)throw new AccessError(503,'SERVICE_UNAVAILABLE');
      const article=this.article(b.articleId);
      return {articleId:b.articleId,savedVersionId:b.savedVersionId,createdAt:b.createdAt,status:article?'available':'unavailable',article:article?{id:article.id,versionId:article.versionId,slug:article.slug,headline:article.headline,correction:article.correction}:null};
    });
  }
  async save(context:AuthContext,id:string){
    await this.identity.authorize(context,'bookmarks:write');
    if(!articleIdSchema.safeParse(id).success)throw new AccessError(422,'INVALID_INPUT');
    const article=this.article(id);if(!article)throw new AccessError(404,'NOT_FOUND');
    const b=await this.repo.addBookmark({userId:context.userId,articleId:id,savedVersionId:article.versionId,createdAt:new Date(this.clock()).toISOString()});
    return {articleId:b.articleId,savedVersionId:b.savedVersionId,createdAt:b.createdAt};
  }
  async remove(context:AuthContext,id:string){
    await this.identity.authorize(context,'bookmarks:write');if(!articleIdSchema.safeParse(id).success)throw new AccessError(422,'INVALID_INPUT');
    await this.repo.removeBookmark(context.userId,id);
  }
}
