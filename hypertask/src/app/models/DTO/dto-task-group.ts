export class DTOTaskGroup {
  public GroupId: string;
  public UserId: string;
  public ColorHex: string;
  public Name: string;
  public Position: number;
  public InitialPosition: number;
  public InsertDate: Date;
  public UpdateDate: Date;
  public Void: boolean;
  public VoidDate: Date;
  public Synced: boolean = false;
  public Sent: boolean = false;
  public RecurringDefault: boolean = false;

  public static fromAny(obj: any): DTOTaskGroup {
    const group = new DTOTaskGroup();
    group.ColorHex = obj.ColorHex;
    group.GroupId = obj.GroupId;
    group.InsertDate = obj.InsertDate;
    group.Name = obj.Name;
    group.Position = obj.Position;
    group.InitialPosition = obj.InitialPosition;
    if (group.InitialPosition == null) {
      group.InitialPosition = group.Position;
    }
    group.UpdateDate = obj.UpdateDate;
    group.UserId = obj.UserId;
    group.Void = obj.Void;
    group.VoidDate = obj.VoidDate;
    group.Synced = obj.Synced;
    group.Sent = obj.Sent;
    group.RecurringDefault = obj.RecurringDefault;

    return group;
  }
}
