import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  juegoON: boolean = true;
  UFOmovimiento: boolean = true;
  invulnerabilidad = false;
  paused = false;

  acelerar: boolean = false;
  girarDerecha: boolean = false;
  girarIzquierda: boolean = false;
  disparoEnAire: boolean = false;

  teclaAcelerar: string = "w";
  teclaIzquierda: string = "a";
  teclaDerecha: string = "d";
  teclaDisparo: string = " ";


  gAngulo: number = 0; /* expresión en grados. Cero grados será cuando la nave mire hacia arriba */
  rotacionSpriteNave: number = 0; /* esto lo he tenido que hacer para que el sprite no de una vuelta al pasar de 0 a 360º */
  /*  vEjeY: number = 0;
   vEjeX: number = 0; */
  multiplicadorImpulso: number = 2.5; /* cuanto se multiplica la propulsión */
  aceleracionY: number = 0;
  aceleracionX: number = 0;
  gravedad: number = 0.2;
  colision: boolean = false;
  msIntervalo: number = 50; /* todos los movimientos se efectuarán en esta duración */

  pxPosicionY: number = window.innerHeight - 150;
  pxPosicionX: number = window.innerWidth / 2;

  pxPosicionY_Bala: number = 2000;
  pxPosicionX_Bala: number = 2000;

  posicionUFO_Y: number = 0;
  posicionUFO_X: number = 0;

 
  sprites: Record<string, string> = {
    "nada": "url(../assets/nada.png)",
    "nave": "url(../assets/nave.png)",
    "naveD1": "url(../assets/naveD1.png)",
    "naveD2": "url(../assets/naveD2.png)",
    "navePropulsion": "url(../assets/navePropulsion.png)",
    "explosion": "url(../assets/explosion.png)",
    "fuegoDerecha": "url(../assets/fuegoDerecha.png)",
    "fuegoIzquierda": "url(../assets/fuegoIzquierda.png)",
    "UFO": "url(../assets/UFO.png)",
  };

  spriteNave: string = this.sprites["nave"];
  spritePropulsionNave: string = this.sprites["nada"];
  spriteDanioNave: string = this.sprites["nada"];
  spriteUFO: string = this.sprites["UFO"];

  constructor() {

    document.addEventListener('keydown', this.pulsarTecla.bind(this));
    document.addEventListener('keyup', this.soltarTecla.bind(this));

    const velocidadUFO: number = 5;
    const cercaniaUFOenX: number = 64;
    const cercaniaUFOenY: number = 32;

    if (this.juegoON == true) {
      setInterval(() => {
        /* ---------- movimiento UFO --------- */
        if (!this.paused) {

          if (this.UFOmovimiento) {
            if (this.posicionUFO_X + 64 < this.pxPosicionX + 16) {
              this.posicionUFO_X += velocidadUFO;
            }
            else { this.posicionUFO_X -= velocidadUFO };

            if (this.posicionUFO_Y + 32 < this.pxPosicionY + 16) {
              this.posicionUFO_Y += velocidadUFO
            }
            else { this.posicionUFO_Y -= velocidadUFO };
          }

          /* --------- Si el UFO toca tu nave --------- */

          const sonidoExplosion = new Audio('url(../../assets/sonidoExplosion.ogg');


          if (this.invulnerabilidad == false && Math.abs((this.posicionUFO_X + 64) - (this.pxPosicionX + 16))
            < cercaniaUFOenX && Math.abs((this.posicionUFO_Y + 32) - (this.pxPosicionY + 16)) < cercaniaUFOenY) {

            if (this.spriteDanioNave == this.sprites["naveD2"]) {
              sonidoExplosion.play()
              this.juegoON = false;
              this.spriteNave = this.sprites["explosion"];
              this.spriteDanioNave = this.sprites["nada"];
              this.invulnerabilidad = true;
              this.aceleracionX = this.aceleracionX / 3;
              this.aceleracionY = this.aceleracionY / 3;
              this.acelerar = false;
              this.UFOmovimiento = false;
            }

            else if (this.spriteDanioNave == this.sprites["naveD1"]) {
              sonidoExplosion.play()
              this.spriteDanioNave = this.sprites["naveD2"];
              this.invulnerabilidad = true;
              this.golpe();
            }
            else if (this.spriteDanioNave == this.sprites["nada"]) {
              sonidoExplosion.play()
              this.spriteDanioNave = this.sprites["naveD1"];
              this.invulnerabilidad = true;
              this.golpe();

            }

          }


          /* --------- si la Bala toca al UFO --------- */
          if (Math.abs(this.posicionUFO_X + 64 - this.pxPosicionX_Bala) < cercaniaUFOenX && Math.abs((this.posicionUFO_Y + 32) - this.pxPosicionY_Bala) < cercaniaUFOenY) {
            /* this.juegoON = false; */
          sonidoExplosion.play()
            this.spriteUFO = this.sprites["explosion"];
            setTimeout(() => {
              this.posicionUFO_X = -400;
              this.posicionUFO_Y = 50;
              this.spriteUFO = this.sprites["UFO"]
            }, 1000)
          }

          /* --------- Movimiento Nave --------- */

          const sonidoPropulsion = new Audio('url(../../assets/sonidoPropulsion.ogg');

          if (this.acelerar || this.girarDerecha || this.girarIzquierda){
          sonidoPropulsion.play()}

          if (!this.colision) {
            this.aceleracionY -= this.gravedad;
          } /* gravedad */

          if (this.pxPosicionY <= (window.innerHeight - 100)) { /* si no toca el suelo */
            this.pxPosicionX += this.aceleracionX;
            this.pxPosicionY -= this.aceleracionY;
          }
          else if (this.pxPosicionY >= (window.innerHeight - 100) && this.aceleracionY >= -10) { /* si toca el suelo despacio */
            this.aceleracionX = 0;
            this.aceleracionY = 0;
            this.colision = true;
            this.pxPosicionY = window.innerHeight - 101;
          }
          else { /* si toca el suelo rápido */
            this.aceleracionX = 0;
            this.aceleracionY = 0;
            this.spriteNave = this.sprites["explosion"];
            this.juegoON = false;
          }

          if (this.acelerar) {                       /* acelerar */
            if (this.gAngulo >= 270) { /* arriba izquierda */
              this.aceleracionY += ((this.gAngulo - 270) / 90 * this.multiplicadorImpulso);
              this.aceleracionX += ((this.gAngulo - 360) / 90) * this.multiplicadorImpulso;
              this.colision = false;
            }
            else if (this.gAngulo <= 90) { /* arriba derecha */
              this.aceleracionY += ((90 - this.gAngulo) / 90 * this.multiplicadorImpulso);
              this.aceleracionX += (this.gAngulo / 90 * this.multiplicadorImpulso);
            }
            else if (this.gAngulo >= 180 && this.gAngulo <= 270) { /* abajo izquierda */
              this.aceleracionY += ((270 - this.gAngulo) / -90 * this.multiplicadorImpulso);
              this.aceleracionX += ((this.gAngulo - 180) / -90 * this.multiplicadorImpulso);
            }
            else if (this.gAngulo >= 90 && this.gAngulo <= 180) { /* abajo derecha */
              this.aceleracionY += ((90 - this.gAngulo) / 90 * this.multiplicadorImpulso);
              this.aceleracionX += ((180 - this.gAngulo) / 90 * this.multiplicadorImpulso);
            }

          }

          var anguloRotacion: number = 15;
          if (this.girarDerecha) {                              /* girar */
            this.spritePropulsionNave = this.sprites["fuegoDerecha"]
            this.gAngulo += anguloRotacion;
            this.rotacionSpriteNave += anguloRotacion;
          }
          else if (this.girarIzquierda) {                       /* girar */
            this.spritePropulsionNave = this.sprites["fuegoIzquierda"]
            this.gAngulo -= anguloRotacion;
            this.rotacionSpriteNave -= anguloRotacion;
          }

          if (this.gAngulo > 360) {
            this.gAngulo -= 360
          }
          else if (this.gAngulo < 0) {
            this.gAngulo += 360
          };
        }
      }, this.msIntervalo);
    }
  }

  golpe() {
    setInterval(() => {

      if (this.invulnerabilidad == true) {
        if (this.spriteNave == this.sprites["nave"]) {
          this.spriteNave = this.sprites["nada"]
        } else if (this.spriteNave == this.sprites["nada"]) {
          this.spriteNave = this.sprites["nave"]
        }
      }

    }, 150)
    this.spriteNave = this.sprites["nada"]


    setTimeout(() => {
      this.spriteNave = this.sprites["nave"];
      this.invulnerabilidad = false;
    }, 3000)
  }

  soltarTecla(event: KeyboardEvent) {

    if (this.juegoON) {

      this.spritePropulsionNave = this.sprites["nada"];

      if (event.key == this.teclaAcelerar) {
        this.acelerar = false;
              }
      if (event.key == this.teclaDerecha) {
        this.girarDerecha = false;
      }
      else if (event.key == this.teclaIzquierda) {
        this.girarIzquierda = false;
      }
    }
  }

  pulsarTecla(event: KeyboardEvent) {

    if (event.key == "Escape") {
      this.paused = !this.paused
    }

    if (this.juegoON) {

      switch (event.key) {
        case this.teclaAcelerar:
          this.acelerar = true;
          this.spritePropulsionNave = this.sprites["navePropulsion"];
          break;
        case this.teclaDerecha:
          this.girarDerecha = true;
          break;
        case this.teclaIzquierda:
          this.girarIzquierda = true;
          break;
      }


      /* --------- disparar ---------  */


      if (this.acelerar || this.girarDerecha || this.girarIzquierda){

      }
      if (event.key == this.teclaDisparo && this.disparoEnAire == false) {
        const grados: number = this.gAngulo;
        const repeticiones: number = 150;/* 15 */
        const tiempoRepeticion: number = 17; /*  frecuencia de muestreo ms */
        const velocidad: number = 20;
        const sonidoDisparo = new Audio('url(../../assets/sonidoDisparo.ogg');

        sonidoDisparo.play()
        this.disparoEnAire = true;
        this.pxPosicionX_Bala = this.pxPosicionX + 16;
        this.pxPosicionY_Bala = this.pxPosicionY + 16;
        if (this.gAngulo >= 270) { /* arriba izquierda */
          for (var i = 0; i <= repeticiones; ++i) {
            setTimeout(() => {
              this.pxPosicionY_Bala -= ((grados - 270) / 90 * velocidad);
              this.pxPosicionX_Bala += ((grados - 360) / 90 * velocidad);
            }, tiempoRepeticion * i)
            if (i == repeticiones) {
              setTimeout(() => {
                this.disparoEnAire = false;
              }, tiempoRepeticion * i)
            }
          }
        }
        else if (this.gAngulo <= 90) { /* arriba derecha */
          for (var i = 0; i <= repeticiones; ++i) {
            setTimeout(() => {
              this.pxPosicionY_Bala -= ((90 - grados) / 90 * velocidad);
              this.pxPosicionX_Bala += (grados / 90 * velocidad);
              if (i == repeticiones) {
                this.disparoEnAire = false;
              }
            }, tiempoRepeticion * i)
            if (i == repeticiones) {
              setTimeout(() => {
                this.disparoEnAire = false;
              }, tiempoRepeticion * i)
            }
          }
        }
        else if (this.gAngulo >= 180 && grados <= 270) { /* abajo izquierda */
          for (var i = 0; i <= repeticiones; ++i) {
            setTimeout(() => {
              this.pxPosicionY_Bala -= ((270 - grados) / -90 * velocidad);
              this.pxPosicionX_Bala += ((grados - 180) / -90 * velocidad);
              if (i == repeticiones) {
                this.disparoEnAire = false;
              }
            }, tiempoRepeticion * i)
            if (i == repeticiones) {
              setTimeout(() => {
                this.disparoEnAire = false;
              }, tiempoRepeticion * i)
            }
          }
        }
        else if (this.gAngulo >= 90 && grados <= 180) { /* abajo derecha */
          for (var i = 0; i <= repeticiones; ++i) {
            setTimeout(() => {
              this.pxPosicionY_Bala -= ((90 - grados) / 90 * velocidad);
              this.pxPosicionX_Bala += ((180 - grados) / 90 * velocidad);
              if (i == repeticiones) {
                this.disparoEnAire = false;
              }
            }, tiempoRepeticion * i)
            if (i == repeticiones) {
              setTimeout(() => {
                this.disparoEnAire = false;
              }, tiempoRepeticion * i)
            }
          }
        }
      }
    }
  }
}

