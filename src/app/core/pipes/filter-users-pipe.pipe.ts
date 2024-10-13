import { Pipe, PipeTransform } from '@angular/core';
import { IProfileUser } from '../interfaces/iprofile-user';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'filterUsers',
  standalone: true
})
export class FilterUsersPipe implements PipeTransform {

  transform(allUsers : IProfileUser[] | null, searchUser : string | null, currentUser : firebase.User | null): IProfileUser[] | null {
    if(allUsers)
      return allUsers.filter((user) => user.displayName.toLowerCase().includes(searchUser!.toLowerCase()) && user.uid !== currentUser?.uid);
    else
      return null;
  }

}
