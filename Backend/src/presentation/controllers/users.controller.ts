import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '새 사용자 생성' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 조회 성공' })
  findOne(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.findOne(idNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiResponse({ status: 200, description: '사용자 수정 성공' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.update(idNum, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  remove(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.remove(idNum);
  }
}
