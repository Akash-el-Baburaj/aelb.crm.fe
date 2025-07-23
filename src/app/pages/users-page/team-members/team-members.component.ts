import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { ActivatedRoute } from '@angular/router';
import { TeamsService } from '../../../services/teams.service';

@Component({
    selector: 'app-team-members',
    imports: [CommonModule ,MatCardModule, MatMenuModule, MatButtonModule, RouterLink, NgFor],
    templateUrl: './team-members.component.html',
    styleUrl: './team-members.component.scss'
})
export class TeamMembersComponent {

    teamId: any;
    team: any;
    teamMemberCard: any[] = []

    constructor(
        public themeService: CustomizerSettingsService,
        private route: ActivatedRoute,
        private teamService: TeamsService
    ) {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.teamId = +params['id'];
                this.getTeamById(this.teamId)
            }
        })
    }

    getTeamById(id: any) {
        this.teamService.getTeamById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.team = res.team
                    this.teamMemberCard = this.team.members
                }
            }
        })
    }

}