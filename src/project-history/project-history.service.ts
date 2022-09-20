import { Injectable, Logger } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateProjectHistoryDto } from './dto/create-project-history.dto';
import { UpdateProjectHistoryDto } from './dto/update-project-history.dto';
import { ProjectHistory } from './schema/project-history.entity';

@Injectable()
export class ProjectHistoryService {
  private readonly logger = new Logger(ProjectHistoryService.name);
  constructor(
    @InjectModel(ProjectHistory)
    private readonly model: ReturnModelType<typeof ProjectHistory>,
  ) {}
  async likeHistory(updateProjectHistoryDto: UpdateProjectHistoryDto) {
    try {
      return this.model.create(updateProjectHistoryDto);
    } catch (error) {
      console.log(error);
    }
  }

  async unLikeHistory(user: string, project: string) {
    try {
      const data = await this.model.findOne({ user, project }).lean();
      // console.log(data?._id);
      return this.model.findByIdAndRemove(data?._id);
    } catch (error) {
      console.log(error);
    }
  }

  create(createProjectHistoryDto: CreateProjectHistoryDto) {
    return 'This action adds a new projectHistory';
  }

  findAll() {
    return `This action returns all projectHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectHistory`;
  }

  update(id: number, updateProjectHistoryDto: UpdateProjectHistoryDto) {
    return `This action updates a #${id} projectHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectHistory`;
  }
}
