import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, collectionData, doc, query,
  where, orderBy, Timestamp ,setDoc ,updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _firestore = inject(Firestore);




  getMessages(visitorId: string): Observable<any[]> {
    const messagesRef = collection(this._firestore, 'chats');
    const q = query(messagesRef, where('visitorId', '==', visitorId), orderBy('timestamp'));
    return collectionData(q, { idField: 'id' });
  }

  sendMessage(visitorId: string, message: string, sender: 'admin' | 'visitor') {
    const timestamp = new Date();
    const chatId = doc(collection(this._firestore, 'chats')).id;
    const chatRef = doc(this._firestore, 'chats', chatId);

    return setDoc(chatRef, {
      chatId,
      visitorId,
      sender,
      message,
      timestamp,
      seenByAdmin: sender === 'admin' ? true : false, // Marcado como visto si lo envía el admin
      seenByVisitor: sender === 'visitor' ? true : false // Marcado como visto si lo envía el visitante
    });
  }


   // Marcar mensajes como leídos por el visitante
   markMessagesAsReadByVisitor(visitorId: string) {
    const messagesRef = collection(this._firestore, 'chats');
    const q = query(messagesRef, where('visitorId', '==', visitorId), where('seenByVisitor', '==', false));

    collectionData(q, { idField: 'id' }).subscribe(messages => {
      messages.forEach(message => {
        const messageRef = doc(this._firestore, 'chats', message.id);
        updateDoc(messageRef, { seenByVisitor: true });
      });
    });
  }

}
