import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
const token = localStorage.getItem('access_token'); // ajustar pra onde o token for guardado
if (!token) return next(req);
return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};