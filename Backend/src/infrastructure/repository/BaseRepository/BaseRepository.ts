import { Model } from "mongoose";
import { IBaseRepository } from "../../../application/interfaces/repositories/BaseRepository/IBaseRepository";


export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly model:Model<any>){}
   async findById(id: string): Promise<T | null> {
     const doc = await this.model.findById(id);
     return doc ? doc.toObject() : null;
   }
}
