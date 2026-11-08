export class Mission {
  constructor(title, description, dueDate, threatLevel, notes = "", checklist = []) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.threatLevel = threatLevel; // Low, Medium, Critical
    this.notes = notes;
    this.checklist = checklist;
    this.accomplished = false;
  }

  toggleStatus() {
    this.accomplished = !this.accomplished;
  }

  updateDetails(title, description, dueDate, threatLevel, notes) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.threatLevel = threatLevel;
    this.notes = notes;
  }

  addChecklistItem(itemText) {
    this.checklist.push({ text: itemText, completed: false });
  }

  toggleChecklistItem(index) {
    if (this.checklist[index]) {
      this.checklist[index].completed = !this.checklist[index].completed;
    }
  }
}
