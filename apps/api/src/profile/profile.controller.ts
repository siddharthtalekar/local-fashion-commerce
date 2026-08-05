import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  updateProfile(@Request() req, @Body() body: { name?: string; phone?: string }) {
    return this.profileService.updateProfile(req.user.id, body);
  }

  @Patch('password')
  changePassword(@Request() req, @Body() body: { currentPassword?: string; newPassword?: string }) {
    return this.profileService.changePassword(req.user.id, body);
  }
}
