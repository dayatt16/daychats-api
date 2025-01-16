class Community {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.description = data.description;
    this.members = data.members;
    this.subGroups = data.subGroups || {};
  }
}

class SubGroup {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.lastMessage = data.lastMessage;
    this.memberCount = data.memberCount;
    this.lastActive = data.lastActive;
  }
}

module.exports = {
  Community,
  SubGroup
}; 