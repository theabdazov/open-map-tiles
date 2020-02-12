import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {map, switchMap, share} from 'rxjs/operators';
import {getRandomInt} from '../util/random';
import {getRandomColor} from '../util/random-color';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  externalIconsName = ['pickup', 'drop'];
  innerIconsName = ['barbell', 'bowl', 'bus', 'circle_heart', 'circle_star', 'dollar', 'food'];

  icons: any = {};
  iconObservable = {};

  constructor(
    private http: Http
  ) {
  }

  getIcon(name: string) {
    if (this.icons[name]) {
      return of(this.icons[name]);
    } else if (this.iconObservable[name]) {
      return this.iconObservable[name];
    } else {
      this.iconObservable[name] = this.http.get(`assets/${name}.svg`).pipe(
        map(res => {
          this.iconObservable[name] = null;
          this.icons[name] = res['_body'];
          return this.icons[name];
        }),
        share()
      );
      return this.iconObservable[name];
    }
  }

  getRandomExternalIcon() {
    return this.getIcon(this.externalIconsName[getRandomInt(0, this.externalIconsName.length)]);
  }

  getRandomInnerIcon() {
    return this.getIcon(this.innerIconsName[getRandomInt(0, this.innerIconsName.length)]);
  }

  prepareIcon(externalIconSvg, innerIconSvg) {
    const regex = /<path[^>]*>/gm;
    const results = JSON.stringify(innerIconSvg).match(regex).join(' ');
    let externalIconSvgJson = JSON.stringify(externalIconSvg).replace(/<\/svg>/, results + '</svg>').replace('#FFFFFF', getRandomColor());
    if (getRandomInt(1, 3) === 1) {
      externalIconSvgJson = externalIconSvgJson.replace(/<path[^>]* class='footer' [^>]*>/, '');
    }
    return JSON.parse(externalIconSvgJson);
  }

  getRandomIcon() {
    return this.getRandomExternalIcon().pipe(
      switchMap(externalIconSvg => {
        return this.getRandomInnerIcon().pipe(
          map(innerIconSvg => {
            return this.prepareIcon(externalIconSvg, innerIconSvg);
          })
        );
      })
    );
  }
}
