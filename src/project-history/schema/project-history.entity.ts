import { prop, Ref } from '@typegoose/typegoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schemas/user.schema';

export class ProjectHistory {
  @prop()
  datelike: number;

  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ ref: () => Project })
  project: Ref<Project>;
}
