import { Timestamp } from "@angular/fire/firestore";
import { IProfileUser } from "./iprofile-user";

export interface IChat {
    id : string,
    lastMessage? : string,
    lastMessageDate? : Timestamp | undefined,
    userIds : string[],
    users : IProfileUser[],

// picture and name of the user sent the message
    chatPic? : string, 
    chatName? : string,
}

export interface IMessage{
    text : string,
    senderId : string,
    sentDate : Timestamp | undefined,
}