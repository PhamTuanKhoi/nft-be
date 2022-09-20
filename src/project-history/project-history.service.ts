import { Injectable } from '@nestjs/common';
import { CreateProjectHistoryDto } from './dto/create-project-history.dto';
import { UpdateProjectHistoryDto } from './dto/update-project-history.dto';

@Injectable()
export class ProjectHistoryService {
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
