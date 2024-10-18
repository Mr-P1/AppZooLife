// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput } from '@ionic/angular/standalone';
// import { ActivatedRoute } from '@angular/router';
// import { ChatService } from '../../common/servicios/chat.service';
// import { Observable } from 'rxjs';
// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.page.html',
//   styleUrls: ['./chat.page.scss'],
//   standalone: true,
//   imports: [IonInput, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
// })
// export class ChatPage implements OnInit {

//   visitorId: string = '';
//   messages$: Observable<any[]> | undefined;
//   newMessage: string = '';

//   constructor(
//     private route: ActivatedRoute,
//     private chatService: ChatService
//   ) { }

//   ngOnInit() {
//     this.visitorId = this.route.snapshot.paramMap.get('id')!;
//     console.log(this.visitorId)
//     this.messages$ = this.chatService.getMessages(this.visitorId);
//     console.log(this.messages$ )
//   }

//   onInputChange(event: Event) {
//     const inputElement = event.target as HTMLInputElement;
//     this.newMessage = inputElement.value;
//   }



//   sendMessage() {
//     if (this.newMessage.trim() !== '') {
//       this.chatService.sendMessage(this.visitorId, this.newMessage, 'visitor').then(() => {
//         this.newMessage = '';
//       });
//     }
//   }

// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../common/servicios/chat.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ChatPage implements OnInit, OnDestroy {

  visitorId: string = '';
  messages$: Observable<any[]> | undefined;
  newMessage: string = '';
  private subscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.visitorId = this.route.snapshot.paramMap.get('id')!;
    console.log(this.visitorId);

    // Obtener y mostrar los mensajes en tiempo real
    this.messages$ = this.chatService.getMessages(this.visitorId);

    // Suscribirse a los mensajes y marcarlos como vistos
    this.subscription = this.messages$.subscribe(messages => {
      this.chatService.markMessagesAsReadByVisitor(this.visitorId);
    });
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newMessage = inputElement.value;
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.chatService.sendMessage(this.visitorId, this.newMessage, 'visitor').then(() => {
        this.newMessage = '';
      });
    }
  }

  ngOnDestroy() {
    // Desuscribirse cuando el componente se destruya para evitar fugas de memoria
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
