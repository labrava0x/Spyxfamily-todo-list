export class Mission {
  constructor(title, description, dueDate, threatLevel, category = "WISE Operations") {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.threatLevel = threatLevel; // Low, Medium, Critical
    this.category = category;
    this.isAccomplished = false;
  }

  toggleAccomplished() {
    this.isAccomplished = !this.isAccomplished;
  }
}