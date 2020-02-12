import {Component, AfterViewInit} from '@angular/core';

import olms from 'ol-mapbox-style';
import {Map, Feature, View} from 'ol';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import {Icon, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Coordinate} from 'ol/coordinate';
import {Extent} from 'ol/extent';
import {IconService} from '../services/icon.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map: Map;
  private iconLayer: VectorLayer;

  count;

  constructor(
    private iconService: IconService
  ) {
  }

  getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  generateCoordinate(extent: Extent) {
    const e = 18000000;
    return [this.getRandomArbitrary(extent[0], extent[2]), this.getRandomArbitrary(extent[1], extent[3])];
  }

  async generateFeature(coordinate: Coordinate): Promise<Feature> {
    return this.iconService.getRandomIcon().toPromise().then(
      svg => {
        const feature = new Feature({
          geometry: new Point(coordinate),
        });
        feature.setStyle(new Style({
          image: new Icon({
            color: '#8959A8',
            src: URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'})),
            scale: 0.3
          })
        }));
        return feature;
      }
    );

  }

  getNewFeatures(coordinates: Coordinate[]) {
    return coordinates.map(coor => this.generateFeature(coor));
  }

  ngAfterViewInit(): void {
    olms('map', 'https://maps.tilehosting.com/styles/basic/style.json?key=BuNi4FPIgsaSVnVlaLoQ').then(
      map => {
        this.map = map;
        this.map.setView(
          new View({
            center: fromLonLat([37.618423, 55.751244]),
            zoom: 10
          })
        );
      }
    );
  }

  addMarkers(count: number) {
    if (this.map && count) {
      const extent: Extent = this.map.getView().calculateExtent(this.map.getSize());
      const coordinates = [];
      for (let index = 0; index < count; index++) {
        coordinates.push(this.generateCoordinate(extent));
      }

      Promise.all(this.getNewFeatures(coordinates)).then(
        features => {
          if (this.iconLayer) {
            this.map.removeLayer(this.iconLayer);
          }
          this.iconLayer = new VectorLayer({
            source: new VectorSource({
              features
            })
          });
          this.map.addLayer(this.iconLayer);
        }
      );

    }
  }

}
