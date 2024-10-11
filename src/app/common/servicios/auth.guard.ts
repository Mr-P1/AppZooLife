import { Auth } from '@angular/fire/auth';
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import {AuthService} from './auth.service'
import { map } from "rxjs";


export const privateGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthService);

    return authState.authState$.pipe(
      map((state) => {
        console.log(state);
        if (!state) {
          router.navigateByUrl('');
          return false;
        }

        return true;
      })
    );
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthService);

    return authState.authState$.pipe(
      map((state) => {
        if (state) {
          router.navigateByUrl('/app/home');
          return false;
        }

        return true;
      })
    );
  };
};
