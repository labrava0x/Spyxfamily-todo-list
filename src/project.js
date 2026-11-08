export class Project {
  constructor(name) {
    this.name = name;
    this.missions = [];
  }

  addMission(mission) {
    this.missions.push(mission);
  }

  removeMission(index) {
    this.missions.splice(index, 1);
  }
}
