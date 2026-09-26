// Clases útiles

class Vector2 {
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    mas(v) {
        return new Vector2(
            this.x + v.x,
            this.y + v.y
        );
    }

    menos(v) {
        return new Vector2(
            this.x - v.x,
            this.y - v.y
        );
    }

    producto(value) {
        return new Vector2(
            this.x * value,
            this.y * value
        );
    }

    dividir(value){
        return new Vector2(
            this.x / value,
            this.y / value
        );
    }

    distancia(v) {
        return Math.hypot(
            this.x - v.x,
            this.y - v.y
        );
    }

    magnitud(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }

    magnitudPorcentaje(){
        let magnitud = this.magnitud();
        return new Vector2(this.x/magnitud, this.y/magnitud);
    }
}

class RectDetecter {
    constructor(inicio = new Vector2(), tamaño = new Vector2()){
        this.inicio = inicio;
        this.tamaño = tamaño;
        this.inicioReal = inicio;
        this.tamañoReal = inicio;
    }
    contieneMouse(v){
        return v.x > this.inicioReal.x && v.x < this.inicioReal.x+this.tamañoReal.x 
            && v.y > this.inicioReal.y && v.y < this.inicioReal.y+this.tamañoReal.y;
    }
    colisionandoConRect(inicio, tamaño){
        this.esqD = this.inicio.x+this.tamaño.x;
        let esqD = inicio.x+tamaño.x;
        this.esqA = this.inicio.y+this.tamaño.y;
        let esqA = inicio.y+tamaño.y;
        return ((this.inicio.x >= inicio.x && this.inicio.x <= esqD) || (this.esqD >= inicio.x && this.esqD <= esqD) || (this.inicio.x < inicio.x && this.esqD > esqD)) &&
            ((this.inicio.y >= inicio.y && this.inicio.y <= esqA) || (this.esqA >= inicio.y && this.esqA <= esqA) || (this.inicio.y < inicio.y && this.esqA > esqA));
    }
}

class Corriente{
    constructor(posicion = new Vector2(), funcion = 0, padre, fuente){
        this.posicion = posicion;
        this.funcion = funcion;
        this.colorDibujable = colorCorriente;
        this.padre = padre;
        this.fuente = fuente;
        this.boundingBox = new RectDetecter(this.posicion.menos(tamañoElectrico*0.5), tamañoElectrico);
    }

    dibujar(){
        ctx.beginPath();
        ctx.lineWidth = tamañoElectrico*2*cam.zoom;
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativa = posicionACamara(this.posicion);
        ctx.arc(posicionRelativa.x, posicionRelativa.y, tamañoElectrico*cam.zoom, 0, Math.PI  * 2, false);
        ctx.stroke();
        ctx.closePath();
    }

    enPantalla(tamaño){
        let mitad = (tamañoElectrico*0.5*cam.zoom);
        this.boundingBox.inicio.x = this.posicion.x - mitad;
        this.boundingBox.inicio.y = this.posicion.y - mitad;
        this.boundingBox.tamaño = tamañoElectrico*cam.zoom;
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }
}

class CirculoUtil {
    constructor(posicion = new Vector2, entrada = true, funcion = 0, radio = 10, atadura = undefined, padre = undefined, salida = undefined, movible = true){
        this.posicion = posicion;
        this.radio = radio;
        this.funcion = funcion;
        this.entrada = entrada;
        this.salida = undefined;
        this.movible = movible;

        if (!entrada){
            this.salidaReferencia = undefined;
            if (salida){
                this.salidaReferencia = salida;
            }
        }else{
            this.entradaReferencia = undefined;
        }

        if (entrada){
            this.color = colorEntradas;
        }else{
            this.color = colorSalidas;
        }
        this.colorDibujable = this.color;

        if (atadura != undefined){
            this.atadura = atadura;
        }
        if (padre != undefined){
            this.padre = padre;
        }
        if (this.funcion != undefined){
            interactuable[funcion].push(this);
        }

        this.vectorRadio = new Vector2(this.radio*2, this.radio*2); 
        this.detector = new RectDetecter(posicion.menos(this.vectorRadio), this.vectorRadio.producto(2));
    }

    contieneMouse(v){
        return this.detector.contieneMouse(v);
    }

    async mover(v, solas = false){
        this.posicion = this.posicion.menos(v);
        this.detector.inicio = this.detector.inicio.menos(v);
        if (this.atadura != undefined && !solas){
            this.atadura.valor = this.atadura.valor.menos(v);
            this.padre.recalcularBoundingBox();
        }
    }

    moverFijo(v){
        this.posicion = v;
        this.detector.inicio = v.menos(this.vectorRadio);;
        if (this.atadura != undefined){
            this.atadura.valor = v;
            this.padre.recalcularBoundingBox();
        }
    }

    dibujar(){
        ctx.beginPath();
        ctx.lineWidth = this.radio*2*cam.zoom;
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativa = posicionACamara(this.posicion);
        this.detector.inicioReal = posicionACamara(this.detector.inicio);
        this.detector.tamañoReal = this.detector.tamaño.producto(cam.zoom);
        ctx.arc(posicionRelativa.x, posicionRelativa.y, this.radio*cam.zoom, 0, Math.PI  * 2, false);
        ctx.stroke();
        ctx.closePath();
    }

    eliminar(){
        if (this.funcion != undefined && interactuable[this.funcion]){
            let propioIndice = interactuable[this.funcion].indexOf(this);
            if (propioIndice !== -1){
                interactuable[this.funcion].splice(propioIndice, 1);
            }
        }
    }
}

class Luz {
    constructor(posicion = new Vector2, funcion = 0, radio = 10, atadura = undefined, padre = undefined){
        this.posicion = posicion;
        this.radio = radio;
        this.funcion = funcion;

        this.activo = 0;
        this.color = colorApagado;
        this.colorDibujable = this.color;

        if (atadura != undefined){
            this.atadura = atadura;
        }
        if (padre != undefined){
            this.padre = padre;
        }

        interactuable[funcion].push(this);

        this.vectorRadio = new Vector2(this.radio*2, this.radio*2); 
        this.detector = new RectDetecter(posicion.menos(this.vectorRadio), this.vectorRadio.producto(2));
    }

    contieneMouse(v){
        return this.detector.contieneMouse(v);
    }

    mover(v, solas = false){
        this.posicion = this.posicion.menos(v);
        this.detector.inicio = this.detector.inicio.menos(v);
        if (this.atadura != undefined && !solas){
            this.atadura.valor = this.atadura.valor.menos(v);
            this.padre.recalcularBoundingBox();
        }
    }

    moverFijo(v){
        this.posicion = v;
        this.detector.inicio = v.menos(this.vectorRadio);;
        if (this.atadura != undefined){
            this.atadura.valor = v;
            this.padre.recalcularBoundingBox();
        }
    }

    dibujar(){
        if (this.activo == 0){
            this.color = colorApagado;
        }else{
            this.color = colorPrendido;
        }
        this.colorDibujable = this.color;
        if (this.activo3Colores != undefined){
            let r = this.activo3Colores[0]*255;
            let g = this.activo3Colores[1]*255;
            let b = this.activo3Colores[2]*255;
            this.colorDibujable = "rgb("+r+","+g+","+b+")";
        }
        
        ctx.beginPath();
        ctx.lineWidth = this.radio*2*cam.zoom;
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativa = posicionACamara(this.posicion);
        this.detector.inicioReal = posicionACamara(this.detector.inicio);
        this.detector.tamañoReal = this.detector.tamaño.producto(cam.zoom);
        ctx.arc(posicionRelativa.x, posicionRelativa.y, this.radio*cam.zoom, 0, Math.PI  * 2, false);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineWidth = 2*cam.zoom;
        ctx.strokeStyle = this.padre.colorDibujable;
        ctx.arc(posicionRelativa.x, posicionRelativa.y, this.radio*2*cam.zoom, 0, Math.PI  * 2, false)
        ctx.stroke();
        ctx.closePath();
    }

    eliminar(){
        let propioIndice = interactuable.indexOf(this);
        if (propioIndice !== -1){
            interactuable.splice(propioIndice, 1);
        }
    }
}

class Lampara{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0){
        this.inicio = {valor: inicio};
        this.final = {valor: final};
        
        this.estadoCorriente = [0];
        this.estado = [0];

        this.funcion = funcion;
        

        this.color = colorCable;
        this.colorDibujable = this.color;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new CirculoUtil(final, true, funcion, grosor/2.5, this.final, this)];
        this.salidas = [new Luz(inicio, funcion, grosor/1, this.inicio, this, true)];
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
    }

    mover(v){
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.salidas[0].activo = this.estado[0];
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        if (this.estado[0] == 1){
            this.colorDibujable = colorCableConCorriente;
        }else{
            this.colorDibujable = this.color;
        }
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom / 2;
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.final.valor, this.funcion, this, f),
                final: this.inicio.valor,
                movimiento: this.inicio.valor.menos(this.final.valor).producto((1.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }

    calcularSeñal(){
        this.estado = this.estadoCorriente;
        return this.estado;
    }

    async transformarCorriente(f){
        if (this.estado[0] == 1){
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class Lampara3Colores{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, corte1 = undefined, corte2 = undefined, corte3 = undefined, corte4 = undefined, corte5 = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};
        this.corte1 = {valor: corte1};
        this.corte2 = {valor: corte2};
        this.corte3 = {valor: corte3};
        this.corte4 = {valor: corte4};
        this.corte5 = {valor: corte5};
        
        this.estadoCorriente = [0, 0, 0];
        this.estado = 0;

        this.funcion = funcion;

        if (corte1 == undefined){
            this.corte1.valor = new Vector2(final.x+50, final.y);
        }
        if (corte2 == undefined){
            this.corte2.valor = new Vector2(final.x-50, final.y);
        } 
        if (corte3 == undefined){
            this.corte3.valor = new Vector2(this.corte2.valor.x, final.y+20);
        }
        if (corte4 == undefined){
            this.corte4.valor = new Vector2(final.x, final.y+20);
        }
        if (corte5 == undefined){
            this.corte5.valor = new Vector2(this.corte1.valor.x, final.y+20);
        }

        this.color = colorCable;
        this.colorDibujable = this.color;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.corte2.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.corte2.valor, this.corte3.valor);
        this.boundingBox4 = rectConLinea(this.final.valor, this.corte4.valor);
        this.boundingBox5 = rectConLinea(this.corte1.valor, this.corte5.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new CirculoUtil(this.corte3.valor, true, funcion, grosor/2.5, this.corte3, this),
            new CirculoUtil(this.corte4.valor, true, funcion, grosor/2.5, this.corte4, this),
            new CirculoUtil(this.corte5.valor, true, funcion, grosor/2.5, this.corte5, this)
        ];
        this.salidas = [new Luz(this.inicio.valor, funcion, grosor/1, this.inicio, this, true)];
        this.salidas[0].activo3Colores = this.estadoCorriente;
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.corte2.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.corte2.valor, this.corte3.valor);
        this.boundingBox4 = rectConLinea(this.final.valor, this.corte4.valor);
        this.boundingBox5 = rectConLinea(this.corte1.valor, this.corte5.valor);
    }

    mover(v){
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.corte1.valor = this.corte1.valor.menos(v);
        this.corte2.valor = this.corte2.valor.menos(v);
        this.corte3.valor = this.corte3.valor.menos(v);
        this.corte4.valor = this.corte4.valor.menos(v);
        this.corte5.valor = this.corte5.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.salidas[0].activo3Colores = this.estadoCorriente;
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        if (this.estado == 1){
            this.colorDibujable = colorCableConCorriente;
        }else{
            this.colorDibujable = this.color;
        }
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte1.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte2.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.corte2.valor);
        posicionRelativaFinal = posicionACamara(this.corte3.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte4.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.corte1.valor);
        posicionRelativaFinal = posicionACamara(this.corte5.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    detectarClickEnLinea(p, x1, y1, x2, y2){
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom  / 2;
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;

        posCamara = posicionACamara(this.corte1.valor);
        let x2_2 = posCamara.x;
        let y2_2 = posCamara.y;

        posCamara = posicionACamara(this.corte2.valor);
        let x2_3 = posCamara.x;
        let y2_3 = posCamara.y;

        posCamara = posicionACamara(this.corte3.valor);
        let x2_4 = posCamara.x;
        let y2_4 = posCamara.y;

        posCamara = posicionACamara(this.corte4.valor);
        let x2_5 = posCamara.x;
        let y2_5 = posCamara.y;

        posCamara = posicionACamara(this.corte5.valor);
        let x2_6 = posCamara.x;
        let y2_6 = posCamara.y;

        return this.detectarClickEnLinea(p, x1, y1, x2, y2) || this.detectarClickEnLinea(p, x2, y2, x2_2, y2_2)
        || this.detectarClickEnLinea(p, x2, y2, x2_3, y2_3) || this.detectarClickEnLinea(p, x2_2, y2_2, x2_4, y2_4)
        || this.detectarClickEnLinea(p, x2, y2, x2_5, y2_5) || this.detectarClickEnLinea(p, x2_2, y2_2, x2_6, y2_6);
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño) || 
        this.boundingBox2.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox3.colisionandoConRect(cam.posicion, tamaño) || 
        this.boundingBox4.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox5.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.final.valor, this.funcion, this, f),
                final: this.inicio.valor,
                movimiento: this.inicio.valor.menos(this.final.valor).producto((2.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }
    async mandarAnimacionCorriente2(f){
        return Promise.all([
            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.corte1.valor, this.funcion, this, f),
                    final: this.final.valor,
                    movimiento: this.final.valor.menos(this.corte1.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            }),

            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.corte2.valor, this.funcion, this, f),
                    final: this.final.valor,
                    movimiento: this.final.valor.menos(this.corte2.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            })
        ]);
    }
    async mandarAnimacionCorriente3(f){
        return Promise.all([
            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.corte3.valor, this.funcion, this, f),
                    final: this.corte2.valor,
                    movimiento: this.corte2.valor.menos(this.corte3.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            }),

            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.corte4.valor, this.funcion, this, f),
                    final: this.final.valor,
                    movimiento: this.final.valor.menos(this.corte4.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            }),

            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.corte5.valor, this.funcion, this, f),
                    final: this.corte1.valor,
                    movimiento: this.corte1.valor.menos(this.corte5.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            })
        ]);
    }

    calcularSeñal(){
        this.estado = Number(this.estadoCorriente[0] == 1 || this.estadoCorriente[1] == 1 || this.estadoCorriente[2] == 1);
        return [Number(this.estado)];
    }

    async transformarCorriente(f){
        if (this.estado == 1){
            await this.mandarAnimacionCorriente3(f);
            await this.mandarAnimacionCorriente2(f);
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class Boton{
    constructor(posicion = new Vector2, funcion = 0, radio = 10, atadura = undefined, padre = undefined, constante = false){
        this.posicion = posicion;
        this.radio = radio;
        this.funcion = funcion;

        this.color = colorBotones;
        this.colorDibujable = this.color;

        this.constante = constante;
        if (constante){
            this.colorDibujable = colorBotonesFuente;
        }

        if (atadura != undefined){
            this.atadura = atadura;
        }
        if (padre != undefined){
            this.padre = padre;
        }

        interactuable[funcion].push(this);

        this.vectorRadio = new Vector2(this.radio*2, this.radio*2); 
        this.detector = new RectDetecter(posicion.menos(this.vectorRadio), this.vectorRadio.producto(2));
    }

    contieneMouse(v){
        return this.detector.contieneMouse(v);
    }

    mover(v, solas = false){
        this.posicion = this.posicion.menos(v);
        this.detector.inicio = this.detector.inicio.menos(v);
        if (this.atadura != undefined && !solas){
            this.atadura.valor = this.atadura.valor.menos(v);
            this.padre.recalcularBoundingBox();
        }
    }

    moverFijo(v){
        this.posicion = v;
        this.detector.inicio = v.menos(this.vectorRadio);;
        if (this.atadura != undefined){
            this.atadura.valor = v;
            this.padre.recalcularBoundingBox();
        }
    }

    dibujar(){
        ctx.beginPath();
        ctx.lineWidth = this.radio*2*cam.zoom;
        ctx.strokeStyle = this.colorDibujable;
        let posicionRelativa = posicionACamara(this.posicion);
        this.detector.inicioReal = posicionACamara(this.detector.inicio);
        this.detector.tamañoReal = this.detector.tamaño.producto(cam.zoom);
        ctx.arc(posicionRelativa.x, posicionRelativa.y, this.radio*cam.zoom, 0, Math.PI  * 2, false);
        ctx.stroke();
        ctx.closePath();
    }

    eliminar(){
        let propioIndice = interactuable.indexOf(this);
        if (propioIndice !== -1){
            interactuable.splice(propioIndice, 1);
        }
    }
}

class BotonAccionable{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};

        this.activo = false;
        
        this.estadoCorriente = [0];
        this.estado = 0;

        this.funcion = funcion;

        this.color = colorCable;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new Boton(inicio, funcion, grosor/1, this.inicio, this)];
        this.salidas = [new CirculoUtil(final, false, funcion, grosor/2.5, this.final, this)];
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
    }

    mover(v){
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = fuentesActivas.indexOf(this);
        if (propioIndice !== -1){
            fuentesActivas.splice(propioIndice, 1);
        }
    }

    dibujar(){
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom / 2;
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.inicio.valor, this.funcion, this, f),
                final: this.final.valor,
                movimiento: this.final.valor.menos(this.inicio.valor).producto((1.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }

    calcularSeñal(){
        this.estado = this.estadoCorriente[0];
        return [Number(this.estado)];
    }

    async transformarCorriente(f){
        if (this.estado == 1){
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class Fuente{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};
        
        this.estadoCorriente = [0];
        this.estado = [0];

        this.funcion = funcion;

        this.color = colorCable;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new Boton(inicio, funcion, grosor/1, this.inicio, this, true)];
        this.salidas = [new CirculoUtil(final, false, funcion, grosor/2.5, this.final, this)];
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
    }

    mover(v){
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = fuentesActivas.indexOf(this);
        if (propioIndice !== -1){
            fuentesActivas.splice(propioIndice, 1);
        }
    }

    dibujar(){
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom / 2;
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.inicio.valor, this.funcion, this, f),
                final: this.final.valor,
                movimiento: this.final.valor.menos(this.inicio.valor).producto((1.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }

    calcularSeñal(){
        this.estado = [this.estadoCorriente[0]];
        return this.estado;
    }

    async transformarCorriente(f){
        if (this.estado == 1){
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class Cable {
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};

        this.estadoCorriente = [0];
        this.estado = [0];
        
        this.funcion = funcion;

        this.color = colorCable;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new CirculoUtil(inicio, true, funcion, grosor/2.5, this.inicio, this)];
        this.salidas = [new CirculoUtil(final, false, funcion, grosor/2.5, this.final, this)];
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
    }

    async mover(v){
        let cambio = false;
        for(let s in this.estadoCorriente){
            if (this.estadoCorriente[s] != 0){
                this.estadoCorriente[s] = 0;
                cambio = true;
            }        
        }
        if (cambio){
            nodosSeñalElectrica.push(this);
        }
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.calcularSeñal();
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado[0] == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom / 2;
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.inicio.valor, this.funcion, this, f),
                final: this.final.valor,
                movimiento: this.final.valor.menos(this.inicio.valor).producto((1.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }

    calcularSeñal(){
        this.estado = this.estadoCorriente;
        return this.estado;
    }

    async transformarCorriente(f){
        if (this.estado[0] == 1){
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class Cable2Salidas{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined, corte1 = undefined, corte2 = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};
        this.corte1 = {valor: corte1};
        this.corte2 = {valor: corte2};

        this.estadoCorriente = [0];
        this.estado = [0, 0];

        if (corte1 == undefined){
            this.corte1.valor = new Vector2(final.x, final.y+50);
        }
        if (corte2 == undefined){
            this.corte2.valor = new Vector2(final.x, final.y-50);
        }

        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.final.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.final.valor, this.corte2.valor);
        
        this.funcion = funcion;

        this.color = colorCable;

        this.grosor = grosor;

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new CirculoUtil(inicio, true, funcion, grosor/2.5, this.inicio, this)];
        this.salidas = [new CirculoUtil(this.corte1.valor, false, funcion, grosor/2.5, this.corte1, this), new CirculoUtil(this.corte2.valor, false, funcion, grosor/2.5, this.corte2, this)];
    }

    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.final.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.final.valor, this.corte2.valor);
    }

    async mover(v){
        let cambio = false;
        for(let s in this.estadoCorriente){
            if (this.estadoCorriente[s] != 0){
                this.estadoCorriente[s] = 0;
                cambio = true;
            }        
        }
        if (cambio){
            nodosSeñalElectrica.push(this);
        }
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.corte1.valor = this.corte1.valor.menos(v);
        this.corte2.valor = this.corte2.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.calcularSeñal();
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado[0] == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte1.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte2.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    detectarClickEnLinea(p, x1, y1, x2, y2){
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom  / 2;
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;

        posCamara = posicionACamara(this.final.valor);
        let x1_2 = posCamara.x;
        let y1_2 = posCamara.y;
        posCamara = posicionACamara(this.corte1.valor);
        let x2_2 = posCamara.x;
        let y2_2 = posCamara.y;

        posCamara = posicionACamara(this.corte2.valor);
        let x2_3 = posCamara.x;
        let y2_3 = posCamara.y;

        return this.detectarClickEnLinea(p, x1, y1, x2, y2) || this.detectarClickEnLinea(p, x1_2, y1_2, x2_2, y2_2) || this.detectarClickEnLinea(p, x1_2, y1_2, x2_3, y2_3);
    }
    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox2.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox3.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.inicio.valor, this.funcion, this, f),
                final: this.final.valor,
                movimiento: this.final.valor.menos(this.inicio.valor).producto((2.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }
    async mandarAnimacionCorriente2(f){
        return Promise.all([
            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.final.valor, this.funcion, this, f),
                    final: this.corte1.valor,
                    movimiento: this.corte1.valor.menos(this.final.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            }),

            new Promise(resolve => {
                corrientesDibujables[this.funcion].push({
                    nodo: crearCorriente(this.final.valor, this.funcion, this, f),
                    final: this.corte2.valor,
                    movimiento: this.corte2.valor.menos(this.final.valor).producto((2.0/delayElectrico)),
                    padre: this,
                    fuente: f,
                    terminar: resolve
                });
            })
        ]);
    }

    calcularSeñal(){
        this.estado = [Number(this.estadoCorriente[0]), Number(this.estadoCorriente[0])];
        return this.estado;
    }

    async transformarCorriente(f){
        if (this.estado[0] == 1){
            await this.mandarAnimacionCorriente(f);
            await this.mandarAnimacionCorriente2(f);
        }
    }
}

class Cable2Entradas{
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined, corte1 = undefined, corte2 = undefined, serAnd = false){
        this.inicio = {valor: inicio};
        this.final = {valor: final};
        this.corte1 = {valor: corte1};
        this.corte2 = {valor: corte2};

        this.estadoCorriente = [0, 0];
        this.estado = [0];

        this.serAnd = serAnd;

        this.tAnimado = [0, 0, 0];

        if (corte1 == undefined){
            this.corte1.valor = new Vector2(final.x, final.y+50);
        }
        if (corte2 == undefined){
            this.corte2.valor = new Vector2(final.x, final.y-50);
        }

        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.final.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.final.valor, this.corte2.valor);
        
        this.funcion = funcion;

        this.color = colorCable;
        if (serAnd){
            this.color = colorCableAnd
        }

        this.grosor = grosor;

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.salidas = [new CirculoUtil(inicio, false, funcion, grosor/2.5, this.inicio, this)];
        this.entradas = [new CirculoUtil(this.corte1.valor, true, funcion, grosor/2.5, this.corte1, this), new CirculoUtil(this.corte2.valor, true, funcion, grosor/2.5, this.corte2, this)];
    }

    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
        this.boundingBox2 = rectConLinea(this.final.valor, this.corte1.valor);
        this.boundingBox3 = rectConLinea(this.final.valor, this.corte2.valor);
    }

    async mover(v){
        let cambio = false;
        for(let s in this.estadoCorriente){
            if (this.estadoCorriente[s] != 0){
                this.estadoCorriente[s] = 0;
                cambio = true;
            }        
        }
        if (cambio){
            nodosSeñalElectrica.push(this);
        }
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.corte1.valor = this.corte1.valor.menos(v);
        this.corte2.valor = this.corte2.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.calcularSeñal();
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte1.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        posicionRelativaInicio = posicionACamara(this.final.valor);
        posicionRelativaFinal = posicionACamara(this.corte2.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    detectarClickEnLinea(p, x1, y1, x2, y2){
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom  / 2;
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;

        posCamara = posicionACamara(this.final.valor);
        let x1_2 = posCamara.x;
        let y1_2 = posCamara.y;
        posCamara = posicionACamara(this.corte1.valor);
        let x2_2 = posCamara.x;
        let y2_2 = posCamara.y;

        posCamara = posicionACamara(this.corte2.valor);
        let x2_3 = posCamara.x;
        let y2_3 = posCamara.y;

        return this.detectarClickEnLinea(p, x1, y1, x2, y2) || this.detectarClickEnLinea(p, x1_2, y1_2, x2_2, y2_2) || this.detectarClickEnLinea(p, x1_2, y1_2, x2_3, y2_3);
    }
    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox2.colisionandoConRect(cam.posicion, tamaño) || this.boundingBox3.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        if(this.tAnimado[2] == ultimoTiempo){
            return;
        }
        this.tAnimado[2] = ultimoTiempo;
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.final.valor, this.funcion, this, f),
                final: this.inicio.valor,
                movimiento: this.inicio.valor.menos(this.final.valor).producto((2.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }
    async mandarAnimacionCorriente2(f){
        if (this.estadoCorriente[0] == 1 && this.estadoCorriente[1] == 1 && (this.tAnimado[0] < ultimoTiempo || this.tAnimado[1] < ultimoTiempo)){
            this.tAnimado[0] = ultimoTiempo;
            this.tAnimado[1] = ultimoTiempo;
            return Promise.all([
                new Promise(resolve => {
                    corrientesDibujables[this.funcion].push({
                        nodo: crearCorriente(this.corte1.valor, this.funcion, this, f),
                        final: this.final.valor,
                        movimiento: this.final.valor.menos(this.corte1.valor).producto((2.0/delayElectrico)),
                        padre: this,
                        fuente: f,
                        terminar: resolve
                    });
                }),

                new Promise(resolve => {
                    corrientesDibujables[this.funcion].push({
                        nodo: crearCorriente(this.corte2.valor, this.funcion, this, f),
                        final: this.final.valor,
                        movimiento: this.final.valor.menos(this.corte2.valor).producto((2.0/delayElectrico)),
                        padre: this,
                        fuente: f,
                        terminar: resolve
                    });
                })
            ]);
        }else if (this.estadoCorriente[0] == 1 && (this.tAnimado[0] < ultimoTiempo)){
            this.tAnimado[0] = ultimoTiempo;
            return Promise.all([
                new Promise(resolve => {
                    corrientesDibujables[this.funcion].push({
                        nodo: crearCorriente(this.corte1.valor, this.funcion, this, f),
                        final: this.final.valor,
                        movimiento: this.final.valor.menos(this.corte1.valor).producto((2.0/delayElectrico)),
                        padre: this,
                        fuente: f,
                        terminar: resolve
                    });
                })
            ]);
        }else if (this.estadoCorriente[1] == 1 && (this.tAnimado[1] < ultimoTiempo)){
            this.tAnimado[1] = ultimoTiempo;
            return Promise.all([
                new Promise(resolve => {
                    corrientesDibujables[this.funcion].push({
                        nodo: crearCorriente(this.corte2.valor, this.funcion, this, f),
                        final: this.final.valor,
                        movimiento: this.final.valor.menos(this.corte2.valor).producto((2.0/delayElectrico)),
                        padre: this,
                        fuente: f,
                        terminar: resolve
                    });
                })
            ]);
        }
        return;
    }
    
    calcularSeñal(){
        if (this.serAnd){
            this.estado = [Number(this.estadoCorriente[0] == 1 && this.estadoCorriente[1] == 1)];
        }else{
            this.estado = [Number(this.estadoCorriente[0] == 1 || this.estadoCorriente[1] == 1)];
        }
        return this.estado;
    }

    async transformarCorriente(f){
        if (this.estado == 1){
            await this.mandarAnimacionCorriente2(f);
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class CableNot {
    constructor(inicio = new Vector2, final = new Vector2, grosor = 1, funcion = 0, salida = undefined){
        this.inicio = {valor: inicio};
        this.final = {valor: final};

        this.estadoCorriente = [0];
        this.estado = [0];
        
        this.funcion = funcion;

        this.color = colorCable;

        this.grosor = grosor;
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);

        nodos[funcion].push(this);
        interactuable[funcion].push(this);

        this.entradas = [new CirculoUtil(inicio, true, funcion, grosor/2.5, this.inicio, this)];
        this.salidas = [new CirculoUtil(final, false, funcion, grosor/2.5, this.final, this)];
    }
    recalcularBoundingBox(){
        this.boundingBox = rectConLinea(this.inicio.valor, this.final.valor);
    }

    async mover(v){
        let cambio = false;
        for(let s in this.estadoCorriente){
            if (this.estadoCorriente[s] != 0){
                this.estadoCorriente[s] = 0;
                cambio = true;
            }        
        }
        if (cambio){
            nodosSeñalElectrica.push(this);
        }
        this.inicio.valor = this.inicio.valor.menos(v);
        this.final.valor = this.final.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].eliminar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = fuentesActivas.indexOf(this);
        if (propioIndice !== -1){
            fuentesActivas.splice(propioIndice, 1);
        }
    }

    dibujar(){
        this.calcularSeñal();
        ctx.beginPath();
        ctx.lineWidth = this.grosor * cam.zoom;
        ctx.strokeStyle = this.color;
        if (this.estado == 1){
            ctx.strokeStyle = colorCableConCorriente;
        }
        let posicionRelativaInicio = posicionACamara(this.inicio.valor);
        let posicionRelativaFinal = posicionACamara(this.final.valor);
        ctx.moveTo(posicionRelativaInicio.x, posicionRelativaInicio.y);
        ctx.lineTo(posicionRelativaFinal.x, posicionRelativaFinal.y);
        ctx.stroke();
        ctx.closePath();

        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    contieneMouse(p){
        let posCamara = posicionACamara(this.inicio.valor);
        let x1 = posCamara.x;
        let y1 = posCamara.y;
        posCamara = posicionACamara(this.final.valor);
        let x2 = posCamara.x;
        let y2 = posCamara.y;
        const dx = x2 - x1;
        const dy = y2 - y1;

        const t = Math.max(0, Math.min(1,
            ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)
        ));

        const cercaX = x1 + t * dx;
        const cercaY = y1 + t * dy;
        return Math.hypot(p.x - cercaX, p.y - cercaY) <= this.grosor*cam.zoom / 2;
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    async mandarAnimacionCorriente(f){
        return new Promise(resolve => {
            corrientesDibujables[this.funcion].push({
                nodo: crearCorriente(this.inicio.valor, this.funcion, this, f),
                final: this.final.valor,
                movimiento: this.final.valor.menos(this.inicio.valor).producto((1.0/delayElectrico)),
                padre: this,
                fuente: f,
                terminar: resolve
            });
        });
    }

    calcularSeñal(){
        if (this.estadoCorriente[0] == 1){
            this.estado = [0];
        }else{
            if (fuentesActivas.indexOf(this) == -1){
                agregarAFuentesActivas(this);
            }
            this.estado = [1];
        }
        return [Number(this.estado)];
    }

    async transformarCorriente(f){
        if (this.estado == 1){
            await this.mandarAnimacionCorriente(f);
        }
    }
}

class ConjuntoCirculos{
    constructor(inicio = new Vector2, funcion = 1, cantidad = 1, salida = true){
        this.inicio = {valor: inicio};
        this.tamaño = new Vector2(100, 200);
        this.funcion = funcion;
        this.cantidad = cantidad;
        this.salida = salida;

        this.estadoCorriente = [];
        this.estado = [];

        this.color = colorFuncion;

        this.boundingBox = new RectDetecter(this.inicio.valor, this.tamaño);
        this.agregar = new RectDetecter(this.inicio.valor, new Vector2(20, 20));
        this.quitar = new RectDetecter(this.inicio.valor.mas(this.tamaño.menos(new Vector2(20, this.tamaño.y))), new Vector2(20, 20));

        nodos[funcion].push(this);
        interactuable[funcion].push(this);
        if (this.salida){
            this.salidas = [];
            for(let i = 0; i < cantidad; i++){
                this.salidas.push(new CirculoUtil(inicio.mas(this.tamaño.menos(this.tamaño.producto(0.5))), false, funcion, 10, new Vector2(0,0), this, undefined, false))
                this.tamaño.y += 50;
                this.estadoCorriente.push(0);
                this.estado.push(0);
            }
        }else{
            this.entradas = [];
            for(let i = 0; i < cantidad; i++){
                this.entradas.push(new CirculoUtil(inicio.mas(this.tamaño.menos(this.tamaño.producto(0.5))), true, funcion, 10, new Vector2(0,0), this, undefined, false))
                this.tamaño.y += 50;
                this.estadoCorriente.push(0);
                this.estado.push(0);
            }
        }
        this.recalcular();
        //for(let i = 1; i < cantidad; i++){
            //this.agregarEntrada();
        //}
    }
    clickeado(p){
        if (this.agregar.contieneMouse(p)){
            this.agregarEntrada();
        }else if(this.quitar.contieneMouse(p)){
            this.quitarEntrada();
        }
    }

    agregarEntrada(){
        if (this.salida){
            this.salidas.push(new CirculoUtil(new Vector2(0,0), false, this.funcion, 10, new Vector2(0,0), this, undefined, false))
        }else{
            this.entradas.push(new CirculoUtil(new Vector2(0,0), true, this.funcion, 10, new Vector2(0,0), this, undefined, false))
        }
        
        this.cantidad += 1;
        this.tamaño.y += 50;
        for(let i in this.entradas){
            this.entradas[i].mover(new Vector2(0,0), true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i in this.salidas){
            this.salidas[i].mover(new Vector2(0,0), true);
            desconectarConexiones(this.salidas[i]);
        }
        this.estadoCorriente.push(0);
        this.estado.push(0);
        this.recalcular();
    }
    quitarEntrada(){
        if (this.cantidad < 2){
            return;
        }
        if (this.salida){
            for(let i = 0; i < this.salidas.length; i++){
                this.salidas[i].mover(new Vector2(0,0), true);
                desconectarConexiones(this.salidas[i]);
            }
            this.salidas.shift();
        }else{
            for(let i = 0; i < this.entradas.length; i++){
                this.entradas[i].mover(new Vector2(0,0), true);
                desconectarConexiones(this.entradas[i]);
            }
            this.entradas.shift();
        }
        this.estadoCorriente.shift();
        this.estado.shift();
        this.cantidad -= 1;
        this.tamaño.y -= 50;
        this.recalcular();
    }

    recalcular(){
        let porcentaje = this.tamaño.y/(this.cantidad+1);
        let paso = this.inicio.valor.y+porcentaje;
        for (let i in this.entradas){
            this.entradas[i].moverFijo(new Vector2(this.inicio.valor.x + this.tamaño.x/2, paso));
            paso+=porcentaje;
        }
        for (let i in this.salidas){
            this.salidas[i].moverFijo(new Vector2(this.inicio.valor.x + this.tamaño.x/2, paso));
            paso+=porcentaje;
        }
        necesitaDibujar = true;
    }

    recalcularBoundingBox(){
        this.boundingBox = new RectDetecter(this.inicio.valor, this.tamaño);
        this.agregar = new RectDetecter(this.inicio.valor, new Vector2(20, 20));
        this.quitar = new RectDetecter(this.inicio.valor.mas(this.tamaño.menos(new Vector2(20, this.tamaño.y))), new Vector2(20, 20));
    }

    async mover(v){
        this.inicio.valor = this.inicio.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i in this.entradas){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i in this.salidas){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
    }
    contieneMouse(p){
        return this.boundingBox.contieneMouse(p);
    }
    dibujar(){
        ctx.fillStyle = this.color;
        let posicionRelativa = posicionACamara(this.inicio.valor);
        this.boundingBox.inicioReal = posicionACamara(this.boundingBox.inicio);
        this.boundingBox.tamañoReal = this.boundingBox.tamaño.producto(cam.zoom);
        ctx.fillRect(posicionRelativa.x, posicionRelativa.y, this.boundingBox.tamañoReal.x, this.boundingBox.tamañoReal.y);
        this.agregar.inicioReal = posicionACamara(this.agregar.inicio);
        this.agregar.tamañoReal = this.agregar.tamaño.producto(cam.zoom);
        ctx.fillStyle = "#0f0";
        ctx.fillRect(this.agregar.inicioReal.x, this.agregar.inicioReal.y, this.agregar.tamañoReal.x, this.agregar.tamañoReal.y);
        this.quitar.inicioReal = posicionACamara(this.quitar.inicio);
        this.quitar.tamañoReal = this.quitar.tamaño.producto(cam.zoom);
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(this.quitar.inicioReal.x, this.quitar.inicioReal.y, this.quitar.tamañoReal.x, this.quitar.tamañoReal.y);
        for(let i in this.entradas){
            this.entradas[i].dibujar();
        }
        for(let i in this.salidas){
            this.salidas[i].dibujar();
        }
    }
    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }
    calcularSeñal(){
        this.estado = this.estadoCorriente;
        return this.estado;
    }
    async transformarCorriente(){
    }
}

class FuncionUtilizable{
    constructor(inicio = new Vector2, funcion = 0, funcionUsada = 1, salida = undefined, usarprecalculado = false, iniciarlo = true){
        this.inicio = {valor: inicio};
        this.tamaño = new Vector2(150, 100);
        this.funcion = funcion;
        this.funcionUsada = funcionUsada;

        this.color = colorFuncion;

        this.funcionNodos = [];
        this.estadoCorriente = [0];
        this.estado = [0];
        this.entradaFuncion = undefined;
        this.salidaFuncion = undefined;
        this.usarprecalculado = usarprecalculado;

        this.boundingBox = new RectDetecter(this.inicio.valor, this.tamaño);

        if (!usarprecalculado){
            nodos[funcion].push(this);
            interactuable[funcion].push(this);
        }

        funcionesBotones.push(this);
        if (!usarprecalculado){
            this.entradas = [new CirculoUtil(inicio, true, funcion, 6, new Vector2(0,0), this, undefined, false)];
            this.salidas = [new CirculoUtil(inicio, false, funcion, 6, new Vector2(0,0), this, undefined, false)];
        }
        if (iniciarlo){
            this.guardarFuncion();
            if (!usarprecalculado){
                this.posicionEntradas();
            }
        }
    }

    recalcularBoundingBox(){
        this.boundingBox = new RectDetecter(this.inicio.valor, this.tamaño);
    }

    async mover(v){
        if (this.usarprecalculado){
            return;
        }
        this.inicio.valor = this.inicio.valor.menos(v);
        this.recalcularBoundingBox();
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(v, true);
            desconectarConexiones(this.entradas[i]);
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].mover(v, true);
            desconectarConexiones(this.salidas[i]);
        }
    }

    eliminar(){
        for(let i in this.entradas){
            this.entradas[i].eliminar();
        }
        for(let i in this.salidas){
            this.salidas[i].eliminar();
        }
        let propioIndice = nodos[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            nodos[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = interactuable[this.funcion].indexOf(this);
        if (propioIndice !== -1){
            interactuable[this.funcion].splice(propioIndice, 1);
        }
        propioIndice = fuentesActivas.indexOf(this);
        if (propioIndice !== -1){
            fuentesActivas.splice(propioIndice, 1);
        }
        propioIndice = funcionesBotones.indexOf(this);
        if (propioIndice !== -1){
            funcionesBotones.splice(propioIndice, 1);
        }
    }

    contieneMouse(p){
        return this.boundingBox.contieneMouse(p);
    }

    dibujar(){
        if (this.usarprecalculado){
            return;
        }
        ctx.fillStyle = this.color;
        let posicionRelativa = posicionACamara(this.inicio.valor);
        this.boundingBox.inicioReal = posicionACamara(this.boundingBox.inicio);
        this.boundingBox.tamañoReal = this.boundingBox.tamaño.producto(cam.zoom);
        ctx.fillRect(posicionRelativa.x, posicionRelativa.y, this.boundingBox.tamañoReal.x, this.boundingBox.tamañoReal.y);
        ctx.fillStyle = "#fff";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = (this.boundingBox.tamaño.x/nombresFunciones[this.funcionUsada-1].length)*cam.zoom+'px sans-serif';
        ctx.fillText(nombresFunciones[this.funcionUsada-1], this.boundingBox.inicioReal.x+this.boundingBox.tamañoReal.x/2, this.boundingBox.inicioReal.y+this.boundingBox.tamañoReal.y/2, this.boundingBox.tamañoReal.y);
        
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].dibujar();
        }
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].dibujar();
        }
    }

    enPantalla(tamaño){
        return this.boundingBox.colisionandoConRect(cam.posicion, tamaño);
    }

    posicionEntradas(sincalcular){
        while (this.entradaFuncion.salidas.length > this.entradas.length){
            this.entradas.push(new CirculoUtil(new Vector2(0,0), true, this.funcion, 6, new Vector2(0,0), this, undefined, false));
            this.estadoCorriente.push(0);
        }
        while(this.entradaFuncion.salidas.length < this.entradas.length){
            this.entradas.shift();
            this.estadoCorriente.shift();
        }
        while (this.salidaFuncion.entradas.length > this.salidas.length){
            this.salidas.push(new CirculoUtil(new Vector2(0,0), false, this.funcion, 6, new Vector2(0,0), this, undefined, false));
            this.estado.push(0);
        }
        while (this.salidaFuncion.entradas.length < this.salidas.length){
            this.salidas.shift();
            this.estado.shift();
        }
        this.tamaño = new Vector2(this.tamaño.x, 100);
        this.cantidad = nodos[this.funcionUsada][0].cantidad;
        if (nodos[this.funcionUsada][1].cantidad > this.cantidad){
            this.cantidad = nodos[this.funcionUsada][1].cantidad;
        }
        this.tamaño.y += this.cantidad*50;
        for(let i = 0; i < this.entradas.length; i++){
            this.entradas[i].mover(new Vector2(0,0), true, sincalcular);
            if (!sincalcular){
                desconectarConexiones(this.entradas[i]);
            }
        }

        this.tamaño.y = 100 + this.cantidad*50;
        for(let i = 0; i < this.salidas.length; i++){
            this.salidas[i].posicion = this.inicio.valor;
            this.salidas[i].mover(new Vector2(0,0), true, sincalcular);
            if (!sincalcular){
                desconectarConexiones(this.salidas[i]);
            }
        }

        this.recalcularEntradasYSalidas();
    }

    recalcularEntradasYSalidas(){
        let porcentaje = this.tamaño.y/(this.cantidad+1);
        let paso = this.inicio.valor.y+porcentaje;
        for (let i in this.entradas){
            this.entradas[i].moverFijo(new Vector2(this.inicio.valor.x, paso));
            paso+=porcentaje;
        }
        paso = this.inicio.valor.y+porcentaje;
        for (let i in this.salidas){
            this.salidas[i].moverFijo(new Vector2(this.inicio.valor.x + this.tamaño.x, paso));
            paso+=porcentaje;
        }
        necesitaDibujar = true;
    }

    agregarNodo(nodo, sincalcular = false){
        let tipo = "cable";
        let mandarSeñal = false;
        if (nodo instanceof Cable2Entradas && nodo.serAnd){
            tipo = "cableand";
        }else if (nodo instanceof Cable2Entradas){
            tipo = "cable2entradas";
        }else if (nodo instanceof Cable2Salidas){
            tipo = "cable2salidas";
        }else if (nodo instanceof CableNot){
            tipo = "cablenot";
        }else if (nodo instanceof ConjuntoCirculos){
            tipo = "conjuntocirculos";
        }else if (nodo instanceof Fuente){
            tipo = "fuente";
            if (nodo.activo == true){
                mandarSeñal = true;
            }
        }else if (nodo instanceof FuncionUtilizable){
            tipo = "funcion";
        }

        let nodoNuevo = new ObjetoCorriente(tipo, this, nodo.funcionUsada);
        nodoNuevo.mandarSeñal = mandarSeñal;
        nodoNuevo.ref = nodo;
        if (!(nodo.estado instanceof Array)){
            nodoNuevo.estado = [nodo.estado];
        }else{
            nodoNuevo.estado = [...nodo.estado];
        }
        nodoNuevo.estadoCorriente = [...nodo.estadoCorriente];
        this.funcionNodos.push(nodoNuevo);
    
        if ((tipo == "conjuntocirculos" && nodo.salida) || tipo != "conjuntocirculos"){
            for (let c in nodo.salidas){
                nodoNuevo.salidas.push(new CirculoUtil(new Vector2(0,0), false, undefined, 6, new Vector2(0,0), nodoNuevo, undefined, false));
            } 
        }
        if ((tipo == "conjuntocirculos" && !nodo.salida) || tipo != "conjuntocirculos"){
            for (let s in nodo.entradas){
                nodoNuevo.entradas.push(new CirculoUtil(new Vector2(0,0), true, undefined, 6, new Vector2(0,0), nodoNuevo, undefined, false));
            }   
        }
        if(tipo == "conjuntocirculos" && nodo.salida){
            this.entradaFuncion = nodoNuevo;
        }else if(tipo == "conjuntocirculos" && !nodo.salida){
            this.salidaFuncion = nodoNuevo;
        }
        if (sincalcular){
            return nodoNuevo;
        }
        for (let i in nodo.entradas){
                if (nodo.entradas[i].entradaReferencia != undefined){
                    let encontrado = false;
                    let nuevoNodoEntrada = undefined;
                    for (let s in this.funcionNodos){
                        if (this.funcionNodos[s].ref == nodo.entradas[i].entradaReferencia.padre){
                            encontrado = true;
                            nuevoNodoEntrada = this.funcionNodos[s];
                        }
                    }
                    if (!encontrado){
                        nuevoNodoEntrada = this.agregarNodo(nodo.entradas[i].entradaReferencia.padre);
                    }
                    nodoNuevo.entradas[i].entradaReferencia = nuevoNodoEntrada.salidas[nodo.entradas[i].entradaReferencia.padre.salidas.indexOf(nodo.entradas[i].entradaReferencia)];
                }
        }
        for (let i in nodo.salidas){
                if (nodo.salidas[i].salidaReferencia != undefined){
                    let encontrado = false;
                    let nuevoNodoSalida = undefined;
                    for (let s in this.funcionNodos){
                        if (this.funcionNodos[s].ref == nodo.salidas[i].salidaReferencia.padre){
                            encontrado = true;
                            nuevoNodoSalida = this.funcionNodos[s];
                        }
                    }
                    if (!encontrado){
                        nuevoNodoSalida = this.agregarNodo(nodo.salidas[i].salidaReferencia.padre);
                    }
                    nodoNuevo.salidas[i].salidaReferencia = nuevoNodoSalida.entradas[nodo.salidas[i].salidaReferencia.padre.entradas.indexOf(nodo.salidas[i].salidaReferencia)];
                }
        }
        return nodoNuevo;
    }

    async guardarFuncion(sincalcular = false){
        for (let n in this.funcionNodos){
            if (this.funcionNodos[n].tipo == "funcion"){
                let indx = funcionesBotones.indexOf(this.funcionNodos[n].funcionCalcular);
                if (indx != -1){
                    funcionesBotones.splice(indx, 1);
                }            
            }
        }
        this.funcionNodos = [];
        for (let n in nodos[this.funcionUsada]){
            let encontrado = false;
            for (let l in this.funcionNodos){
                if (this.funcionNodos[l].ref == nodos[this.funcionUsada][n]){
                    encontrado = true;
                }
            }
            if (!encontrado){
                this.agregarNodo(nodos[this.funcionUsada][n], sincalcular);
            }
        }
        if (!this.usarprecalculado){
            if (this.entradaFuncion.salidas.length != this.entradas.length || this.salidaFuncion.entradas.length != this.salidas.length){
                this.posicionEntradas(sincalcular);
            }
        }
        // await this.calcularSeñal();
        // necesitaSeñalElectrica = true;
    }

    async calcularSeñal(){
        let corrienteEstatus = [...this.estadoCorriente];

        this.entradaFuncion.estadoCorriente = [...corrienteEstatus];

        await señalElectrica(this.entradaFuncion, true, false, 100);

        this.estado = [...this.salidaFuncion.estadoCorriente];

        return this.estado;
    }

    async transformarCorriente(f){
    }
}

class ObjetoCorriente{
    constructor(tipo = "cable", padre = undefined, funcion = 0){
        this.inicio = {valor: new Vector2(0,0)};
        this.tipo = tipo;

        this.estadoCorriente = [0, 0];
        this.estado = [0];
        this.padre = padre;

        this.entradas = [];
        this.salidas = [];
        if (tipo == "funcion"){
            this.funcion = funcion;
            this.funcionCalcular = new FuncionUtilizable(new Vector2(0,0), funcionActual, funcion, undefined, true);
        }
        this.calcularSeñal();
    }
    mover(v){
        if (tipo == "funcion"){
            this.funcionCalcular.mover(new Vector2(0,0));
        }
        return;
    }
    moverFijo(){
        return;
    }
    dibujar(){
        return;
    }
    async calcularSeñal(){
        if (this.tipo == "cable2entradas"){
            this.estado = [Number((this.estadoCorriente[0] == 1 || this.estadoCorriente[1] == 1))];
        }else if (this.tipo == "cable"){
            this.estado = this.estadoCorriente;
        }else if (this.tipo == "cableand"){
            this.estado = [Number((this.estadoCorriente[0] == 1 && this.estadoCorriente[1] == 1))];
        }else if (this.tipo == "cable2salidas"){
            this.estado = [Number(this.estadoCorriente[0]), Number(this.estadoCorriente[0])];
        }else if (this.tipo == "cablenot"){
            if (this.estadoCorriente[0] == 1){
                this.estado = [0];
            }else{
                this.estado = [1];
            }
        }else if (this.tipo == "conjuntocirculos"){
            this.estado = this.estadoCorriente;
        }
        else if (this.tipo == "funcion"){
            this.funcionCalcular.estadoCorriente = this.estadoCorriente;
            await this.funcionCalcular.calcularSeñal();
            this.estado = this.funcionCalcular.estado;
        }
        for (let i in this.estado){
            if (this.estado[i] === false || this.estado[i] === true){
                this.estado[i] = Number(this.estado[i])
            }
        }
        return this.estado;
    }
    async transformarCorriente(){
    }
}

class Camara {
    constructor(posicion = new Vector2, zoom = 1){
        this.posicion = posicion;
        this.zoom = zoom;
        this.conseguirCentro();
    }

    conseguirCentro(){
        this.centro = new Vector2(
            this.posicion.x+window.innerWidth/2,
            this.posicion.y+window.innerHeight/2
        )
    }
}

// Declaraciones generales
let necesitaDibujar = false;
let necesitaSeñalElectrica = false;
let funcionActual = 0;
let fps = 60;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let cam = new Camara(new Vector2(0, 0), 1); // Crear cámara general del simulador
let zoomIntervalo = new Vector2(0.05, 3); // zoom mínimo - zoom máximo
let zoomPorcentaje = 1/50; // Porcentaje de cambio de zoom

let nodos = [[]]; // Nodos dibujables por separado (dibujan sus hijos y se hacen cargo de ellos, ellos mismos)
let interactuable = [[]]; // Nodos que aceptan click
let corrientesDibujables = [[]]; // Dibujar corrientes [posicion, final, velocidad, nodopadre]
let fuentesActivas = [];
let funcionesBotones = [];
let abrirFuncionBotones = [];
let nombresFunciones = [];
let nodosSeñalElectrica = [];

// Mouse
let posicionMouse = new Vector2(); // Crear posición del mouse inicial, cambiará si mueves el mouse
let posicionMouseAnteriorFrame = new Vector2();
let movimientoClick = true;

let mouseRueda = false; // Flag cuando la rueda está siendo presionada
let mouseLClick = false; // Flag cuando el click izquierdo está siendo presionado
let mouseRClick = false; // Flag cuando el click derecho está siendo presionado
let bloqueSeleccionado = undefined;
let cargando = false;

// Convenciones
let colorMezcla = "#2F2"; // Color al mezclar entrada con salida
let colorBotones = "#e7702b";
let colorBotonesFuente = "#e82c2c";
let colorEntradas = "#e871f8";
let colorSalidas = "#5bdcf3";
let colorCorriente = "rgb(66, 151, 219)";
let colorCable = "#000";
let colorCableAnd = "#d8b92f";
let colorCableConCorriente = "#4297db";
let colorFuncion = "#7e7e7e";
let colorApagado = "#2c2c2c"
let colorPrendido = "#f5e12c"
let gapCuadricula = 150;
let widthCuadricula = 7;
let gapCuadriculaCamara = gapCuadricula*cam.zoom;
let widthCuadriculaCamara = widthCuadricula*cam.zoom;
let delayElectrico = 0.25;
let tamañoElectrico = 5;
let verCorriente = true;
let frecuenciaFlujoNormal = 0.25;
let frecuenciaFlujoSinCargas = 0.01;
let frecuenciaFlujo = frecuenciaFlujoNormal;
let versionMIC = 1;
if (!verCorriente){
    frecuenciaFlujo = frecuenciaFlujoSinCargas;
}
let rectBasura = new RectDetecter(new Vector2(0, canvas.height-50), new Vector2(50, 50));


// Funciones útiles
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function posicionACamara(position) {
    return new Vector2(
        (position.x - cam.posicion.x) * cam.zoom,
        (position.y - cam.posicion.y) * cam.zoom
    );
};

function camaraAGlobal(position){
    return new Vector2(
        (position.x/cam.zoom + cam.posicion.x),
        (position.y/cam.zoom + cam.posicion.y) 
    )
}

function centroPantalla(){
    return new Vector2(
        cam.posicion.x+(canvas.width/2)/cam.zoom,
        cam.posicion.y+(canvas.height/2)/cam.zoom
    )
}

function dibujarNodos(){
    dibujarCuadricula();
    let vectorTamaño = new Vector2(window.innerWidth,window.innerHeight).producto(1/cam.zoom);
    for (let nodo of nodos[funcionActual]) {
        if (nodo.enPantalla(vectorTamaño)){
            nodo.dibujar(); 
        }
    }
    if(verCorriente){
        for (let corriente of corrientesDibujables[funcionActual]){
            if(corriente.nodo != undefined){
                if (corriente.nodo.enPantalla(vectorTamaño)){
                    corriente.nodo.dibujar();
                }
            }
        }
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(0, canvas.height-70, 70, 70);
}

function limpiarNodos(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

function actualizarNodos(){
    limpiarNodos();
    dibujarNodos();
}

function dibujarCuadricula(){
    let iniciox = (cam.posicion.x % gapCuadricula) * cam.zoom;
    let inicioy = (cam.posicion.y % gapCuadricula) * cam.zoom;
    ctx.lineWidth = widthCuadriculaCamara;
    ctx.strokeStyle = "#cdcdcd";
    for(let linea = -iniciox; linea < window.innerWidth+widthCuadriculaCamara; linea+=gapCuadriculaCamara){
        ctx.beginPath();
        ctx.moveTo(linea, 0);
        ctx.lineTo(linea, window.innerHeight);
        ctx.stroke();
        ctx.closePath();
    }
    for(let linea = -inicioy; linea < window.innerHeight+widthCuadriculaCamara; linea+=gapCuadriculaCamara){
        ctx.beginPath();
        ctx.moveTo(0, linea);
        ctx.lineTo(window.innerWidth, linea);
        ctx.stroke();
        ctx.closePath();
    }
}

function agregarANodosSeñal(bloque){
    if (nodosSeñalElectrica.indexOf(bloque) == -1){
        nodosSeñalElectrica.push(bloque);
    }
    return;
}

function agregarAFuentesActivas(nodo){
    if (fuentesActivas.indexOf(nodo) == -1){
        fuentesActivas.push(nodo);
    }  
}

function eliminarNodoSeñal(bloque){
    let indx = nodosSeñalElectrica.indexOf(bloque);
    if (indx != -1){
        nodosSeñalElectrica.splice(indx, 1);
    }
    return;
}

async function clickIzquierdo(){
    if (cargando){
        return;
    }
    for (let i = interactuable[funcionActual].length-1; i >= 0; i--){       
        let nodo = interactuable[funcionActual][i];
        if (nodo.contieneMouse(posicionMouse) && (nodo.movible == undefined || nodo.movible == true)){
            if (nodo instanceof ConjuntoCirculos){
                nodo.clickeado(posicionMouse);
            }
            movimientoClick = false;
            bloqueSeleccionado = nodo;
            if (bloqueSeleccionado instanceof Boton){
                bloqueSeleccionado.padre.estadoCorriente[0] = 1;
                bloqueSeleccionado.padre.estado[0] = 1;          
                if (bloqueSeleccionado.constante){
                    if (!bloqueSeleccionado.padre.activo){
                        bloqueSeleccionado.padre.activo = true;
                        agregarAFuentesActivas(bloqueSeleccionado.padre);
                    }else{
                        bloqueSeleccionado.padre.activo = false;
                        bloqueSeleccionado.padre.estadoCorriente[0] = 0;
                        bloqueSeleccionado.padre.estado[0] = 0;
                    }
                }else{   
                    agregarAFuentesActivas(bloqueSeleccionado.padre);
                }
                necesitaSeñalElectrica = true;
            }
            return;
        }
    }
    bloqueSeleccionado = undefined;
}

function vaciarCorriente(bloque){
    let indxEntrada = bloque.salidaReferencia.padre.entradas.indexOf(bloque.salidaReferencia);
    bloque.salidaReferencia.padre.estadoCorriente[indxEntrada] = 0;
}   

function desconectarConexiones(bloque = undefined, indice){  
    if (bloque == undefined){
        bloque = interactuable[indice];
    }
    if (bloque.salidaReferencia != undefined){
        necesitaSeñalElectrica = true;
        bloque.colorDibujable = bloque.color;
        bloque.salidaReferencia.colorDibujable = bloque.salidaReferencia.color;

        vaciarCorriente(bloque);

        bloque.salidaReferencia.entradaReferencia = undefined;
        bloque.salidaReferencia = undefined;
    }
    if (bloque.entradaReferencia != undefined){
        necesitaSeñalElectrica = true;
        bloque.colorDibujable = bloque.color;
        bloque.entradaReferencia.colorDibujable = bloque.entradaReferencia.color;

        vaciarCorriente(bloque.entradaReferencia);

        bloque.entradaReferencia.salidaReferencia = undefined;
        bloque.entradaReferencia = undefined;
    }
}

function conectarCirculos(entrada, salida){
    if (salida.salidaReferencia != undefined){
        return;
    }
    entrada.colorDibujable = colorMezcla;
    salida.colorDibujable = colorMezcla;
    entrada.entradaReferencia = salida;
    salida.salidaReferencia = entrada;
}

function clickIzquierdoSoltado(){
    if (bloqueSeleccionado instanceof Boton){
        if (!bloqueSeleccionado.constante){
            let inicial = bloqueSeleccionado.padre.estado;
            bloqueSeleccionado.padre.estadoCorriente[0] = 0;
            bloqueSeleccionado.padre.estado = 0;
        }
        bloqueSeleccionado = undefined;
        return;
    }
    for (let i = interactuable[funcionActual].length-1; i >= 0; i--){       
        let nodo = interactuable[funcionActual][i];
        if (nodo.contieneMouse(posicionMouse) && nodo != bloqueSeleccionado && nodo.entrada == !bloqueSeleccionado.entrada && nodo.padre != bloqueSeleccionado.padre && bloqueSeleccionado.padre != undefined){
            if (!nodo.entrada){
                conectarCirculos(bloqueSeleccionado, nodo);
            }else{
                conectarCirculos(nodo, bloqueSeleccionado);
            }

            bloqueSeleccionado.moverFijo(nodo.posicion);

            necesitaDibujar = true;

            agregarANodosSeñal(bloqueSeleccionado.padre);
            agregarANodosSeñal(nodo.padre);

            return;
        }
    }
    if(posicionMouse.y > canvas.height-70 && posicionMouse.x < 70){
        if(!bloqueSeleccionado.padre){
            bloqueSeleccionado.mover(new Vector2());
            bloqueSeleccionado.eliminar();
            necesitaDibujar = true;
        }
    }
    bloqueSeleccionado = undefined;
}

function rectConLinea(inicio, final){
    let newRect = new RectDetecter();
    if (inicio.x > final.x){
        newRect.inicio.x = final.x;
        newRect.tamaño.x = inicio.x-final.x;
    }else{
        newRect.inicio.x = inicio.x;
        newRect.tamaño.x = final.x-inicio.x;
    }
    if (inicio.y > final.y){
        newRect.inicio.y = final.y;
        newRect.tamaño.y = inicio.y-final.y;
    }else{
        newRect.inicio.y = inicio.y;
        newRect.tamaño.y = final.y-inicio.y;
    }
    return newRect;
}

function crearCorriente(posicion, funcion, padre, fuente){
    if (!verCorriente){
        return undefined;
    }
    return new Corriente(posicion, funcion, padre, fuente);
}

let señales = 0;
let ejecsmax = Infinity;
async function señalElectrica(nodoInicio, instantaneo, inicial, ejecsmaxEstaSeñal = ejecsmax){
    if (nodoInicio == undefined){
        return;
    }
    señales+=1;
    console.log("SEÑAL ELECTRICA"+señales)
    let ejecs = 0;
    let nodosAElectrificar = [[nodoInicio]];
    let nodosYaEncontrados = [];
    
    while (nodosAElectrificar.length > 0){
        for (let i = 0; i < nodosAElectrificar[0].length; i++){
            if (nodosAElectrificar[0][i].estaEliminado != undefined){
                return;
            }
            await nodosAElectrificar[0][i].calcularSeñal();
        }

        let arrayElectrificar = [];
        for (let i = 0; i < nodosAElectrificar[0].length; i++){
            let nodo = nodosAElectrificar[0][i];
            if (nodo.salidas == undefined){
                continue;
            }
            for (let indxSalida = 0; indxSalida < nodo.salidas.length; indxSalida++){
                let entradaEncontrada = nodo.salidas[indxSalida].salidaReferencia;
                if (entradaEncontrada != undefined && entradaEncontrada.padre.entradas){
                    let siguiente = entradaEncontrada.padre;

                    let indxEntrada = siguiente.entradas.indexOf(entradaEncontrada);
                    let nuevoEstado = nodo.estado[indxSalida];
                    if (inicial || Number(siguiente.estadoCorriente[indxEntrada]) !== nuevoEstado){
                        siguiente.estadoCorriente[indxEntrada] = nuevoEstado;

                        if (inicial || arrayElectrificar.indexOf(siguiente) === -1){
                            arrayElectrificar.push(siguiente);
                        }
                    }
                }
            }           
        }

        nodosAElectrificar.push(arrayElectrificar);
        nodosAElectrificar.shift();

        ejecs++;
        necesitaDibujar = true;

        if (!instantaneo){
            await esperar(frecuenciaFlujo*1000);
        }

        if (ejecs > ejecsmaxEstaSeñal){
            console.log("Quemado", ejecsmaxEstaSeñal)
            console.error("COBERTURA ANTI BUCLE INFINITO DE WHILE (HUBO "+ejecsmaxEstaSeñal+" EJECUCIONES DE CORRIENTE EN UNA SOLA SEÑAL)")
            return;
        }

        // Cerrar bucle en caso de cortocircuito o que no haya que electrificar
        if (arrayElectrificar.length == 0){
            return;
        }
    }
}

function spawnMedio(s){
    if(s == "cableComun"){
        new Cable(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual);
    }else if(s == "cable2Entradas"){
        new Cable2Entradas(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual, undefined, centroPantalla().mas(new Vector2(100,50)),centroPantalla().mas(new Vector2(100,-50)), false);
    }else if(s == "cable2Salidas"){
        new Cable2Salidas(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual, undefined, centroPantalla().mas(new Vector2(100,50)),centroPantalla().mas(new Vector2(100,-50)));
    }else if(s == "boton"){
        new BotonAccionable(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual);
    }else if(s == "fuente"){
        new Fuente(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual);
    }else if(s == "cableNot"){
        new CableNot(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual);
    }else if(s == "cableAnd"){
        new Cable2Entradas(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual, undefined, centroPantalla().mas(new Vector2(100,50)),centroPantalla().mas(new Vector2(100,-50)), true);
    }else if(s == "lampara"){
        new Lampara(centroPantalla().mas(new Vector2(-100,0)),centroPantalla().mas(new Vector2(100,0)), 10, funcionActual);
    }else if(s == "lampara3Colores"){
        new Lampara3Colores(centroPantalla().mas(new Vector2(0,0)),centroPantalla().mas(new Vector2(0,40)), 10, funcionActual);
    }
    necesitaDibujar = true;
}

async function actualizarFunciones(guardando = true, señal = true){
    for (let n in funcionesBotones){
        let nodo = funcionesBotones[n];
        if (nodo instanceof FuncionUtilizable){
            if (guardando){
                await nodo.guardarFuncion(!señal);
            }
        }
    }
    necesitaDibujar = true;
}

async function actualizarEspecifica(n){
    for (let i in funcionesBotones){
        let nodo = funcionesBotones[i];
        if (nodo instanceof FuncionUtilizable && nodo.funcionUsada == n){
            nodo.guardarFuncion(false);
            nodo.calcularSeñal();
        }   
    }
    necesitaDibujar = true;
}

function agregarFlagEliminar(){
    for (let i = 0; i < nodos.length; i++){
        for (let n = 0; n < nodos[i].length; n++){
            nodos[i][n].estaEliminado = true;
        }
    }
}

async function eliminarFuncion(id){
    for(let i = 0; i < nodos.length; i++){
        for (let n = 0; n < nodos[i].length; n++){
            if (nodos[i][n].funcionUsada == id){
                let nodo = nodos[i][n];
                nodo.mover(new Vector2(0,0));
                nodos[i].splice(n, 1);
                nodo.eliminar();
                n--;
            }else{
                if (nodos[i][n].funcion > id){
                    nodos[i][n].funcion--;
                }
            }
        }
    }
    for (let i = 0; i < fuentesActivas.length; i++){
        if (fuentesActivas[i].funcion == id){
            fuentesActivas[i].mover(new Vector2(0,0));
            fuentesActivas[i].eliminar();
            i--;
        }else{
            if (fuentesActivas[i].funcion > id){
                fuentesActivas[i].funcion--;
            }
        }
    }
    for (let i = 0; i < funcionesBotones.length; i++){
        if (funcionesBotones[i].funcionCalcular == undefined){
            if (funcionesBotones[i].funcionUsada == id){
                funcionesBotones[i].mover(new Vector2(0,0));
                funcionesBotones[i].eliminar();
                i--;
            }else if(funcionesBotones[i].funcionUsada > id){
                funcionesBotones[i].funcionUsada-=1;
            }
        }
    }
    for (let i = 0; i < abrirFuncionBotones.length; i++){
        if(abrirFuncionBotones[i].val == id){
            abrirFuncionBotones[i].parentNode.removeChild(abrirFuncionBotones[i]);
            abrirFuncionBotones.splice(i, 1);
            i--;
        }else if(abrirFuncionBotones[i].val > id){
            abrirFuncionBotones[i].val--;
        }
    }
    interactuable.splice(id, 1);
    nodos.splice(id, 1);
    corrientesDibujables.splice(id, 1);
    nombresFunciones.splice(id-1, 1);
    if (funcionActual >= id){
        funcionActual--;
    }
    await actualizarFunciones();
    for(let i = 0; i < nodos.length; i++){
        for (let n = 0; n < nodos[i].length; n++){
            for (let s in nodos[i][n].estadoCorriente){
                nodos[i][n].estadoCorriente[s] = 0;
                if (nodos[i][n].activo){
                    nodos[i][n].activo = false;
                }
            }
        }
    }
    necesitaSeñalElectrica = true;
}

function tomarValorTiempoCorrespondiente(){
    const valorDecimal = parseFloat(textCargas.value.replace(',', '.'));
    
    if (!isNaN(valorDecimal) && valorDecimal !== 0) {
        console.log("El nuevo valor es:", valorDecimal);
        frecuenciaFlujo = valorDecimal;
    }else{
        if (verCorriente){
            frecuenciaFlujo = frecuenciaFlujoNormal;
        }else{
            frecuenciaFlujo = frecuenciaFlujoSinCargas; 
        }
    }
}

// Funciones de carga y guardado
class ProyectoBinario{
    constructor(){
        this.data = [];
    }

    string(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);

        this.int32(bytes.length);

        for (let i = 0; i < bytes.length; i++) {
            this.int8(bytes[i]);
        }
    }

    int8(value){
        this.data.push(value);
    }
    int16(value){
        this.data.push(value & 0xFF);
        this.data.push((value >> 8) & 0xFF)
    }
    int32(value){
        this.data.push(value & 0xFF);
        this.data.push((value >> 8) & 0xFF)
        this.data.push((value >> 16) & 0xFF)
        this.data.push((value >> 24) & 0xFF)
    }
    float32(value){
        const view = new DataView(new ArrayBuffer(4));
        view.setFloat32(0, value, true);
        for (let i = 0; i < 4; i++){
            this.data.push(view.getUint8(i));
        }
    }
    buffer(){
        return new Uint8Array(this.data);
    }

    tipoDeNodo(nodo, id){
        if (nodo instanceof Cable){
            this.int8(0x01);
            this.cable(nodo, id);
        }else if(nodo instanceof Cable2Salidas){
            this.int8(0x02);
            this.cable(nodo, id);
        }else if(nodo instanceof Fuente){
            this.int8(0x03);
            this.fuente(nodo, id);
        }else if(nodo instanceof BotonAccionable){
            this.int8(0x04);
            this.fuente(nodo, id)
        }else if(nodo instanceof Cable2Entradas){
            this.int8(0x05);
            this.cable(nodo, id);
        }else if(nodo instanceof Lampara){
            this.int8(0x06);
            this.cable(nodo, id);
        }else if(nodo instanceof FuncionUtilizable){
            this.int8(0x07);
            this.funcionutilizable(nodo, id);
        }else if(nodo instanceof ConjuntoCirculos){
            this.int8(0x08);
            this.conjuntocirculos(nodo, id);
        }else if(nodo instanceof CableNot){
            this.int8(0x09);
            this.cable(nodo, id);
        }else if(nodo instanceof Lampara3Colores){
            this.int8(0x0a);
            this.cable(nodo, id);
        }
    }
    encontrarID(nodo, f){
        for (let n = 0; n < nodos[f].length; n++){
            if (nodos[f][n] == nodo){
                return n+1;
            }
        }
        return false;
    }

    cable(nodo, id){  
        // VECTORES
        this.float32(nodo.inicio.valor.x);
        this.float32(nodo.inicio.valor.y);
        this.float32(nodo.final.valor.x);
        this.float32(nodo.final.valor.y);
        // EXTRA POSICIONES SI LAS TIENE
        if (nodo instanceof Cable2Salidas || nodo instanceof Cable2Entradas){
            this.float32(nodo.corte1.valor.x);
            this.float32(nodo.corte1.valor.y);
            this.float32(nodo.corte2.valor.x);
            this.float32(nodo.corte2.valor.y);
        }else if (nodo instanceof Lampara3Colores){
            this.float32(nodo.corte3.valor.x);
            this.float32(nodo.corte3.valor.y);
            this.float32(nodo.corte4.valor.x);
            this.float32(nodo.corte4.valor.y);
            this.float32(nodo.corte5.valor.x);
            this.float32(nodo.corte5.valor.y);
        }

        // SI ES AND
        if (nodo instanceof Cable2Entradas){
            this.int8(nodo.serAnd);
        }

        // ESTADO
        for (let i = 0; i < nodo.estado.length; i++){
            this.int8(Number(nodo.estado[i]));
        }
        // ESTADOCORRIENTE
        for (let i = 0; i < nodo.estadoCorriente.length; i++){
            this.int8(Number(nodo.estadoCorriente[i]));
        }

        // REFERENCIA SALIDA
        for (let s in nodo.salidas){
            let referenciaSalida = nodo.salidas[s].salidaReferencia
            id = 0;
            let id2 = 0;
            if (referenciaSalida){
                id = this.encontrarID(referenciaSalida.padre, nodo.funcion);
                if (id == false){
                    console.error("NO ID SALIDA ENCONTRADA PARA ", referenciaSalida);
                }else{
                    id2 = referenciaSalida.padre.entradas.indexOf(referenciaSalida);
                    if(id2 == -1){
                        console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida)
                    }
                }
            }
            this.int32(id);
            this.int16(id2);
        }

        // REFERENCIA ENTRADA
        for (let e in nodo.entradas){
            let referenciaEntrada = nodo.entradas[e].entradaReferencia;
            id = 0;
            let id2 = 0;
            if (referenciaEntrada){
                id = this.encontrarID(referenciaEntrada.padre, nodo.funcion);
                if (id == false){
                    console.error("NO ID ENTRADA ENCONTRADA");
                }else{
                    id2 = referenciaEntrada.padre.salidas.indexOf(referenciaEntrada);
                    if(id2 == -1){
                        console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida);
                    }
                }
            }
            this.int32(id);
            this.int16(id2);
        }
    }

    conjuntocirculos(nodo, id){
        // VECTORES
        this.float32(nodo.inicio.valor.x);
        this.float32(nodo.inicio.valor.y);

        // SI ES SALIDA
        this.int8(Number(nodo.salida));

        // CANTIDAD DE ENTRADAS/SALIDAS
        this.int16(nodo.cantidad);

        // ESTADO
        for (let i = 0; i < nodo.estado.length; i++){
            this.int8(Number(nodo.estado[i]));
        }
        // ESTADOCORRIENTE
        for (let i = 0; i < nodo.estadoCorriente.length; i++){
            this.int8(Number(nodo.estadoCorriente[i]));
        }

        // REFERENCIA SALIDA
        if (nodo.salida){
            for (let s in nodo.salidas){
                let referenciaSalida = nodo.salidas[s].salidaReferencia
                id = 0;
                let id2 = 0;
                if (referenciaSalida){
                    id = this.encontrarID(referenciaSalida.padre, nodo.funcion);
                    if (id == false){
                        console.error("NO ID SALIDA ENCONTRADA PARA ", referenciaSalida);
                    }else{
                        id2 = referenciaSalida.padre.entradas.indexOf(referenciaSalida);
                        if(id2 == -1){
                            console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida)
                        }
                    }
                }
                this.int32(id);
                this.int16(id2);
            }
        }else{ // REFERENCIA ENTRADA
            for (let e in nodo.entradas){
                let referenciaEntrada = nodo.entradas[e].entradaReferencia;
                id = 0;
                let id2 = 0;
                if (referenciaEntrada){
                    id = this.encontrarID(referenciaEntrada.padre, nodo.funcion);
                    if (id == false){
                        console.error("NO ID ENTRADA ENCONTRADA");
                    }else{
                        id2 = referenciaEntrada.padre.salidas.indexOf(referenciaEntrada);
                        if(id2 == -1){
                            console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida);
                        }
                    }
                }
                this.int32(id);
                this.int16(id2);
            }
        }
    }

    funcionutilizable(nodo, id){
        // VECTORES
        this.float32(nodo.inicio.valor.x);
        this.float32(nodo.inicio.valor.y);
        // FUNCION USADA
        this.int32(nodo.funcionUsada);

        // ESTADO
        this.int16(nodo.estado.length);
        for (let i = 0; i < nodo.estado.length; i++){
            this.int8(Number(nodo.estado[i]));
        }
        // ESTADOCORRIENTE
        this.int16(nodo.estadoCorriente.length);
        for (let i = 0; i < nodo.estadoCorriente.length; i++){
            this.int8(Number(nodo.estadoCorriente[i]));
        }

        // REFERENCIA SALIDA
        this.int16(nodo.salidas.length);
        for (let s in nodo.salidas){
            let referenciaSalida = nodo.salidas[s].salidaReferencia
            id = 0;
            let id2 = 0;
            if (referenciaSalida){
                id = this.encontrarID(referenciaSalida.padre, nodo.funcion);
                if (id == false){
                    console.error("NO ID SALIDA ENCONTRADA PARA ", referenciaSalida);
                }else{
                    id2 = referenciaSalida.padre.entradas.indexOf(referenciaSalida);
                    if(id2 == -1){
                        console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida)
                    }
                }
            }
            this.int32(id);
            this.int16(id2);
        }

        // REFERENCIA ENTRADA
        this.int16(nodo.entradas.length);
        for (let e in nodo.entradas){
            let referenciaEntrada = nodo.entradas[e].entradaReferencia;
            id = 0;
            let id2 = 0;
            if (referenciaEntrada){
                id = this.encontrarID(referenciaEntrada.padre, nodo.funcion);
                if (id == false){
                    console.error("NO ID ENTRADA ENCONTRADA");
                }else{
                    id2 = referenciaEntrada.padre.salidas.indexOf(referenciaEntrada);
                    if(id2 == -1){
                        console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaEntrada);
                    }
                }
            }
            this.int32(id);
            this.int16(id2);
        }
    }

    fuente(nodo, id){   
        // VECTORES
        this.float32(nodo.inicio.valor.x);
        this.float32(nodo.inicio.valor.y);
        this.float32(nodo.final.valor.x);
        this.float32(nodo.final.valor.y);

        // ACTIVO
        this.int8(nodo.activo);

        // REFERENCIA SALIDA
        let referenciaSalida = nodo.salidas[0].salidaReferencia
        id = 0;
        let id2 = 0;
        if (referenciaSalida){
            id = this.encontrarID(referenciaSalida.padre, nodo.funcion);
            if (id == false){
                console.error("NO ID SALIDA ENCONTRADA PARA ", referenciaSalida);
            }else{
                id2 = referenciaSalida.padre.entradas.indexOf(referenciaSalida);
                if(id2 == -1){
                    console.error("NO ID2 ENTRADA ENCONTRADA PARA ", referenciaSalida);
                }
            }
        }
        this.int32(id);
        this.int16(id2);
    }
}

class CargarBinario{
    constructor(buffer){
        this.view = new DataView(buffer);
        this.offset = 0;
    }

    string() {
        const longitud = this.int32();

        const bytes = new Uint8Array(
        this.view.buffer,
        this.view.byteOffset + this.offset,
        longitud
        );

        this.offset += longitud;

        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    int8(){
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    }
    int16(){
        const value = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return value;
    }
    int32(){
        const value = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return value;
    }
    float32(){
        const value = this.view.getFloat32(this.offset, true);
        this.offset += 4;
        return value;
    }
    header(){
        let arrayHeader = [];
        for(let i = 0; i < 16; i++){
            const value = this.view.getInt8(this.offset);
            arrayHeader.push(value);
            this.offset+=1;
        }
        return arrayHeader;
    }
    crearObjeto(f){
        const tipoDeObjeto = this.int8();
        if (tipoDeObjeto == 0x01){
            this.cable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x02){
            this.cable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x03){
            this.fuente(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x04){
            this.fuente(tipoDeObjeto, f)
        }else if(tipoDeObjeto == 0x05){
            this.cable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x06){
            this.cable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x07){
            this.funcionutilizable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x08){
            this.conjuntocirculos(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x09){
            this.cable(tipoDeObjeto, f);
        }else if(tipoDeObjeto == 0x0a){
            this.cable(tipoDeObjeto, f);
        }
    }
    cable(tipoDeObjeto, f){
        let vectorInicio = new Vector2(this.float32(), this.float32());
        let vectorFinal = new Vector2(this.float32(), this.float32());
        let objetoEntregado = undefined;
        if (tipoDeObjeto == 0x01){
            objetoEntregado = new Cable(vectorInicio, vectorFinal, 10, f);
        }else if (tipoDeObjeto == 0x02){
            let vectorCorte1 = new Vector2(this.float32(), this.float32());
            let vectorCorte2 = new Vector2(this.float32(), this.float32());
            objetoEntregado = new Cable2Salidas(vectorInicio, vectorFinal, 10, f, undefined, vectorCorte1, vectorCorte2);
        }else if (tipoDeObjeto == 0x05){
            let vectorCorte1 = new Vector2(this.float32(), this.float32());
            let vectorCorte2 = new Vector2(this.float32(), this.float32());
            const esAnd = this.int8();
            let esAndBool = esAnd == 1 ? true : false
            objetoEntregado = new Cable2Entradas(vectorInicio, vectorFinal, 10, f, undefined, vectorCorte1, vectorCorte2, esAndBool);
        }else if (tipoDeObjeto == 0x09){
            objetoEntregado = new CableNot(vectorInicio, vectorFinal, 10, f, undefined);
        }else if (tipoDeObjeto == 0x06){
            objetoEntregado = new Lampara(vectorInicio, vectorFinal, 10, f, undefined);
        }else if(tipoDeObjeto == 0x0a){
            let vectorCorte3 = new Vector2(this.float32(), this.float32());
            let vectorCorte4 = new Vector2(this.float32(), this.float32());
            let vectorCorte5 = new Vector2(this.float32(), this.float32());
            objetoEntregado = new Lampara3Colores(vectorInicio, vectorFinal, 10, f, undefined, undefined, vectorCorte3, vectorCorte4, vectorCorte5);
        }
        for (let i = 0; i < objetoEntregado.estado.length; i++){
            const estado = this.int8();
            objetoEntregado.estado[i] = estado;
        }
        for (let i = 0; i < objetoEntregado.estadoCorriente.length; i++){
            const estadoCorriente = this.int8();
            objetoEntregado.estadoCorriente[i] = estadoCorriente;
        }
        for (let i = 0; i < objetoEntregado.salidas.length; i++){
            const salidaID = this.int32();
            const circuloID = this.int16();
            objetoEntregado.salidas[i].salidaReferencia = [salidaID, circuloID];
        }
        for (let i = 0; i < objetoEntregado.entradas.length; i++){
            const entradaID = this.int32();
            const circuloID = this.int16();
            objetoEntregado.entradas[i].entradaReferencia = [entradaID, circuloID];
        }
    }
    conjuntocirculos(tipoDeObjeto, f){
        let vectorInicio = new Vector2(this.float32(), this.float32());
        const esSalida = this.int8();
        let esSalidaBool = esSalida == 1 ? true : false
        const cantidad = this.int16();
        let objetoEntregado = new ConjuntoCirculos(vectorInicio, f, cantidad, esSalidaBool);
        
        objetoEntregado.recalcular();
        for (let i = 0; i < cantidad; i++){
            const estado = this.int8();
            objetoEntregado.estado[i] = estado;
        }
        for (let i = 0; i < cantidad; i++){
            const estadoCorriente = this.int8();
            objetoEntregado.estadoCorriente[i] = estadoCorriente;
        }
        if (esSalidaBool){
            for (let i = 0; i < cantidad; i++){
                const salidaID = this.int32();
                const circuloID = this.int16();
                objetoEntregado.salidas[i].salidaReferencia = [salidaID, circuloID];
            }
        }else{
            for (let i = 0; i < cantidad; i++){
                const entradaID = this.int32();
                const circuloID = this.int16();
                objetoEntregado.entradas[i].entradaReferencia = [entradaID, circuloID];
            }
        }
    }
    funcionutilizable(nodo, f){
        let vectorInicio = new Vector2(this.float32(), this.float32());
        const funcionUsada = this.int32();
        let objetoEntregado = new FuncionUtilizable(vectorInicio, f, funcionUsada, undefined, false, false);
        const estados = this.int16();
        for (let i = 0; i < estados; i++){
            const estado = this.int8();
            objetoEntregado.estado[i] = estado;
        }
        const estadosCorriente = this.int16();
        for (let i = 0; i < estadosCorriente; i++){
            const estadoCorriente = this.int8();
            objetoEntregado.estadoCorriente[i] = estadoCorriente;
        }
        const cantidadSalidas = this.int16();
        for (let i = 0; i < cantidadSalidas; i++){
            if (i > 0){
                objetoEntregado.salidas.push(new CirculoUtil(objetoEntregado.inicio.valor, false, f, 6, new Vector2(0,0), objetoEntregado, undefined, false));
            }
            const salidaID = this.int32();
            const circuloID = this.int16();
            objetoEntregado.salidas[i].salidaReferencia = [salidaID, circuloID];
        }
        const cantidadEntradas = this.int16();
        for (let i = 0; i < cantidadEntradas; i++){
            if (i > 0){
                objetoEntregado.entradas.push(new CirculoUtil(objetoEntregado.inicio.valor, true, f, 6, new Vector2(0,0), objetoEntregado, undefined, false));
            }
            const entradaID = this.int32();
            const circuloID = this.int16();
            objetoEntregado.entradas[i].entradaReferencia = [entradaID, circuloID];
        }     
    }
    fuente(tipoDeObjeto, f){
        let vectorInicio = new Vector2(this.float32(), this.float32());
        let vectorFinal = new Vector2(this.float32(), this.float32());
        let objetoEntregado = undefined;
        if (tipoDeObjeto == 0x04){
            objetoEntregado = new BotonAccionable(vectorInicio, vectorFinal, 10, f);
        }else if (tipoDeObjeto == 0x03){
            objetoEntregado = new Fuente(vectorInicio, vectorFinal, 10, f);
        }
        const estaActivo = this.int8();
        let estaActivoBool = estaActivo === 1 ? true : false;
        objetoEntregado.activo = estaActivoBool;
        if (estaActivoBool){
            objetoEntregado.estado[0] = 1;
            objetoEntregado.estadoCorriente[0] = 1;
            agregarAFuentesActivas(objetoEntregado);
        }
        const salidaID = this.int32();
        const circuloID = this.int16();
        objetoEntregado.salidas[0].salidaReferencia = [salidaID, circuloID];
    }
}

async function cargar_ruta(ruta) {
    const response = await fetch(ruta);

    if (!response.ok) {
        throw new Error(`No se pudo cargar ${ruta}`);
    }

    const blob = await response.blob();

    const archivo = new File(
        [blob],
        ruta.split("/").pop(),
        { type: blob.type }
    );

    return archivo;
}

let guardar = document.getElementById("guardarProyecto");
guardar.addEventListener('click', guardarProyecto);
async function guardarProyecto(){
    const soportaCompresion = 'CompressionStream' in window && 'DecompressionStream' in window;
    let proyecto = new ProyectoBinario;

    // HEADER 16 BYTES
    proyecto.int8(0x4D); // M
    proyecto.int8(0x41); // A
    proyecto.int8(0x47); // G
    proyecto.int8(0x47); // G
    proyecto.int8(0x49); // I
    proyecto.int8(0x43); // C
    proyecto.int8(0x49); // I
    proyecto.int8(0x52); // R
    proyecto.int8(0x43); // C
    proyecto.int8(0x55); // U
    proyecto.int8(0x49); // I
    proyecto.int8(0x54); // T
    
    proyecto.int32(versionMIC) // Version del MIC

    // CAMARA 12 BYTES
    // VECTOR CAMARA
    proyecto.float32(cam.posicion.x); 
    proyecto.float32(cam.posicion.y);
    // ZOOM CAMARA
    proyecto.float32(cam.zoom);

    // CANTIDAD DE FUNCIONES
    proyecto.int16(nodos.length);
    // NOMBRES FUNCIONES
    for(let i = 0; i < nombresFunciones.length; i++){
        proyecto.string(nombresFunciones[i]);
    }

    // FUNCIONES EN CADA UNO
    for (let i in nodos){
        let funcion = nodos[i];
        proyecto.int32(funcion.length);
        for (let n = 0; n < funcion.length; n++){
            let nodo = funcion[n];
            proyecto.tipoDeNodo(nodo, n+1);
        }
    }

    // DESCARGAR ARCHIVO
    const blob = new Blob(
        [proyecto.buffer()],
        { type: "application/octet-stream" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "circuito.icircuit";
    a.click();
    URL.revokeObjectURL(url);
}

let arrayHeader = [0x4D,0x41,0x47,0x47,0x49,0x43,0x49,0x52,0x43,0x55,0x49,0x54, versionMIC, 0, 0, 0];

async function cargarProyecto(archivo){
    buffer = await archivo.arrayBuffer();
    cargando = true;
    
    const lector = new CargarBinario(buffer);

    const headerAbierto = lector.header();
    
    for(let i = 0; i < arrayHeader.length; i++){
        if (arrayHeader[i] != headerAbierto[i]){
            console.error("EL ARCHIVO NO ES COMPATIBLE O ES UNA VERSION DISTINTA.");
            return;
        }
    }

    for (let i in abrirFuncionBotones){
        abrirFuncionBotones[i].parentNode.removeChild(abrirFuncionBotones[i]);
    }
    abrirFuncionBotones = [];
    nombresFunciones = [];

    cam.posicion.x = lector.float32();
    cam.posicion.y = lector.float32();
    cam.zoom = lector.float32();
    cam.zoom = 1;
    gapCuadriculaCamara = gapCuadricula * cam.zoom;
    widthCuadriculaCamara = widthCuadricula * cam.zoom;
    necesitaDibujar = true;
    necesitaSeñalElectrica = true;

    agregarFlagEliminar();    
    nodos = [];
    interactuable = [];
    fuentesActivas = [];
    funcionesBotones = [];
    corrientesDibujables = [];
    nodosSeñalElectrica = [];
    funcionActual = 0;
    const cantidadFunciones = lector.int16();

    // NOMBRES FUNCIONES
    for (let i = 0; i < cantidadFunciones-1; i++){
        let texto = lector.string()
        nombresFunciones.push(texto);
    }

    for (let i = 0; i < cantidadFunciones; i++){
        nodos.push([]);
        interactuable.push([]);
        corrientesDibujables.push([]);

        const cantidadNodos = lector.int32();
        for (let n = 0; n < cantidadNodos; n++){
            lector.crearObjeto(i);
        }
        if (i != 0){
            let botonAgregarFuncion = document.createElement("p");
            let botonNuevo = document.getElementById("mainFuncion").cloneNode();
            botonNuevo.agregarFuncion = botonAgregarFuncion;
            botonNuevo.val = Number(i);
            botonNuevo.textContent = nombresFunciones[botonNuevo.val-1];
            document.getElementById("verFunciones").appendChild(botonNuevo);
            abrirFuncionBotones.push(botonNuevo);

            botonNuevo.addEventListener('dblclick', (evento) =>{
                botonNuevo.contentEditable = 'true';
                botonNuevo.focus();
            });

            botonNuevo.addEventListener('click', (evento) =>{
                actualizarEspecifica(Number(funcionActual));
                funcionActual = botonNuevo.val;
                necesitaDibujar = true;
            });

            botonNuevo.addEventListener('contextmenu', (evento) => {
                evento.preventDefault(); // Esto evita que salga el menú clásico del navegador
                eliminarFuncion(botonNuevo.val);
            });

            botonNuevo.addEventListener('blur', (evento) => {
                botonNuevo.contentEditable = 'false';
                nombresFunciones[botonNuevo.val-1] = botonNuevo.textContent.trim();
                botonAgregarFuncion.textContent = botonNuevo.textContent.trim();
            });

            botonNuevo.addEventListener('keydown', (evento) => {
                if (evento.key === 'Enter') {
                    evento.preventDefault();
                    evento.currentTarget.blur();
                }
            });
            
            botonAgregarFuncion.className = "img fondoOscuro";
            botonAgregarFuncion.textContent = nombresFunciones[botonNuevo.val-1];
            botonAgregarFuncion.val = botonNuevo.val;
            abrirFuncionBotones.push(botonAgregarFuncion);
            document.getElementById("menuObjetosFunciones").appendChild(botonAgregarFuncion);
            botonAgregarFuncion.addEventListener('click', (evento) => {
                if (botonNuevo.val == funcionActual){
                    alert("No puedes poner la misma función dentro de si misma.");
                }else{
                    let encontrado = false;
                    for (let c in funcionesBotones){
                        if (funcionesBotones[c].funcion == botonNuevo.val && funcionesBotones[c].funcionUsada == funcionActual){
                            encontrado = true;
                            alert("No puedes utilizar esta función aqui porque crearías un bucle.")
                        }
                    }
                    if (!encontrado){
                        new FuncionUtilizable(centroPantalla().mas(new Vector2(-100,0)), funcionActual, botonNuevo.val);
                    }
                }
            });            
        }
    }

    // CONEXIONES
    for (let i = 0; i < nodos.length; i++){
        for (let n = 0; n < nodos[i].length; n++){
            if (nodos[i][n].salidas){
                for (let s = 0; s < nodos[i][n].salidas.length; s++){
                    let valores = [];
                    valores = [...nodos[i][n].salidas[s].salidaReferencia];
                    
                    if (valores != undefined){
                        if (valores[0] != 0){
                            if (nodos[i][valores[0]-1] instanceof ConjuntoCirculos && nodos[i][valores[0]-1].salida){
                                nodos[i][n].salidas[s].salidaReferencia = nodos[i][valores[0]-1].salidas[valores[1]];
                            }else{
                                nodos[i][n].salidas[s].salidaReferencia = nodos[i][valores[0]-1].entradas[valores[1]];
                            }
                            nodos[i][n].salidas[s].colorDibujable = colorMezcla;
                        }else{
                            nodos[i][n].salidas[s].salidaReferencia = undefined;
                        }
                    }

                }
            }
            if (nodos[i][n].entradas){
                for (let s = 0; s < nodos[i][n].entradas.length; s++){
                    let valores = nodos[i][n].entradas[s].entradaReferencia;
                    if (valores != undefined && valores[0] != 0){
                        nodos[i][n].entradas[s].entradaReferencia = nodos[i][valores[0]-1].salidas[valores[1]];
                        nodos[i][n].entradas[s].colorDibujable = colorMezcla;
                    }else{
                        nodos[i][n].entradas[s].entradaReferencia = undefined;
                    }
                }
            }
        }
    }

    await actualizarFunciones(true, false);
    for (let i = 0; i < nodos.length; i++){
        for (let n = 0; n < nodos[i].length; n++){
            if (nodos[i][n] instanceof FuncionUtilizable){
                nodos[i][n].posicionEntradas(true);
            }
        }
    }
    await actualizarFunciones();
    cargando = false;
    
    necesitaSeñalElectrica = true;
    return;
}
const fileInput = document.getElementById("fileInput");

let cargar = document.getElementById("cargarProyecto");
guardar.addEventListener('click', guardarProyecto);
cargar.addEventListener("click", async () => {
    // Obtenemos el archivo seleccionado
    const file = fileInput.files[0];
    await cargarProyecto(file);
});

// Responder al usuario
// Dibujar inicialmente y dibujar y cambiar tamaño al recibir mover la ventana
dibujarNodos();
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cam.conseguirCentro();
    necesitaDibujar = true;
});

// Permitir zoom in y zoom out
window.addEventListener("wheel", function(event) {
    mouseNoScroll.inicioReal = new Vector2(20, canvas.height-((canvas.height/100)*67+80));
    mouseNoScroll.tamañoReal = new Vector2((canvas.width/100)*8+100, (canvas.height/100)*55+10);
    if (mouseNoScroll.contieneMouse(posicionMouse)){
        return;
    }

    let zoomAntes = cam.zoom;
    if (event.deltaY > 0 && cam.zoom != zoomIntervalo.x) { // Hacia abajo
        cam.zoom -= cam.zoom*zoomPorcentaje;
    }else if (event.deltaY < 0 && cam.zoom != zoomIntervalo.y) { // Hacia arriba
        cam.zoom += cam.zoom*zoomPorcentaje;
    }else{
        return
    }

    gapCuadriculaCamara = gapCuadricula * cam.zoom;
    widthCuadriculaCamara = widthCuadricula * cam.zoom;

    cam.zoom = Math.min(Math.max(cam.zoom, zoomIntervalo.x), zoomIntervalo.y);
    cam.posicion = cam.posicion.menos(cam.centro.menos(posicionMouse).producto(zoomPorcentaje*3));
    necesitaDibujar = true;
}, { passive: true });

// Guardar posicion del mouse
window.addEventListener('mousemove', function(event) {
    movimientoClick = true;
    posicionMouse.x = event.clientX;
    posicionMouse.y = event.clientY;
});

// Detectar botones down
document.addEventListener('mousedown', function(event) {
    if (event.button === 1) {   
        mouseRueda = true;
    }else if(event.button === 0){
        mouseLClick = true;
        clickIzquierdo();
    }
});

// Detectar botones up
document.addEventListener('mouseup', function(event) {
    if (event.button === 1) {   
        mouseRueda = false;
    }else if(event.button === 0){
        mouseLClick = false;
        if(bloqueSeleccionado != undefined){
            clickIzquierdoSoltado();
        }
    }
});

// No permitir menú del click derecho
/*document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});*/

// Responder a la interacción del usuario con el menú
let frameMenuPrincipal = document.getElementById("menuPrincipal");
let salir = document.getElementById("volverPrincipal");

let btnCables = document.getElementById("menuPrincipalCables");
let btnFuentes = document.getElementById("menuPrincipalFuentes");
let btnLuces = document.getElementById("menuPrincipalLuces");
let btnFunciones = document.getElementById("menuPrincipalFunciones");

let frameCables = document.getElementById("menuObjetosCables");
let frameFuentes = document.getElementById("menuObjetosFuentes");
let frameLuces = document.getElementById("menuObjetosLuces");
let frameFunciones = document.getElementById("menuObjetosFunciones");

salir.addEventListener('click', (evento) =>{
    menuPrincipal.className = "active";
    salir.className = "hidden botonSuperior";
    frameCables.className = "hidden menuObjetos cables";
    frameFuentes.className = "hidden menuObjetos fuentes";
    frameLuces.className = "hidden menuObjetos luces";
    frameFunciones.className = "hidden menuObjetos funciones";
});

btnCables.addEventListener('click', (evento) => {
    menuPrincipal.className = "hidden";
    salir.className = "active botonSuperior";
    frameCables.className = "active menuObjetos cables";
});
btnFuentes.addEventListener('click', (evento) => {
    menuPrincipal.className = "hidden";
    salir.className = "active botonSuperior";
    frameFuentes.className = "active menuObjetos fuentes";
});
btnLuces.addEventListener('click', (evento) => {
    menuPrincipal.className = "hidden";
    salir.className = "active botonSuperior";
    frameLuces.className = "active menuObjetos luces";
});
btnFunciones.addEventListener('click', (evento) => {
    menuPrincipal.className = "hidden";
    salir.className = "active botonSuperior";
    frameFunciones.className = "active menuObjetos funciones";
});

let btncableComun = document.getElementById("cableComun");
let btncable2Salidas = document.getElementById("cable2Salidas");
let btncable2Entradas = document.getElementById("cable2Entradas");
let btncableAnd = document.getElementById("cableAnd");

let btnlampara = document.getElementById("lampara");
let btnlampara3Colores = document.getElementById("lampara3Colores");

let btnBoton = document.getElementById("boton");
let btnFuente = document.getElementById("fuente");
let btncableNot = document.getElementById("cableNot");

btncableComun.addEventListener('click', (evento) => {spawnMedio("cableComun");});
btncable2Salidas.addEventListener('click', (evento) => {spawnMedio("cable2Salidas");});
btncable2Entradas.addEventListener('click', (evento) => {spawnMedio("cable2Entradas");});
btncableAnd.addEventListener('click', (evento) => {spawnMedio("cableAnd");});
btnlampara.addEventListener('click', (evento) => {spawnMedio("lampara");});
btnlampara3Colores.addEventListener('click', (evento) => {spawnMedio("lampara3Colores");});
btnBoton.addEventListener('click', (evento) => {spawnMedio("boton");});
btnFuente.addEventListener('click', (evento) => {spawnMedio("fuente");});
btncableNot.addEventListener('click', (evento) => {spawnMedio("cableNot");});

let btnverCargas = document.getElementById("verCargas");
verCargas.addEventListener('click', (evento) => {
    verCorriente = !verCorriente;
    if (verCorriente){
        verCargas.className ="botonSuperior"; 
    }else{
        verCargas.className="noVerCargas botonSuperior";
    }
    tomarValorTiempoCorrespondiente();
    necesitaSeñalElectrica = true;
    necesitaDibujar = true;
});

let textCargas = document.getElementById("tiempoCargas");

textCargas.addEventListener('input', (evento) => {
    tomarValorTiempoCorrespondiente();
});

// Responder a la interacción del usuario con el menu funciones
let btnAñadirFuncion = document.getElementById("añadirFuncion");
btnAñadirFuncion.addEventListener('click', (evento) =>{
    funcionActual = nodos.length;
    corrientesDibujables.push([]);
    interactuable.push([]);
    nodos.push([]);
    new ConjuntoCirculos(centroPantalla().menos(new Vector2(200, 0)), funcionActual, 1, true)
    new ConjuntoCirculos(centroPantalla().mas(new Vector2(150, 0)), funcionActual, 1, false)
    necesitaDibujar = true;

    nombresFunciones.push("FuncionNueva");

    let botonAgregarFuncion = document.createElement("p");

    let botonNuevo = document.getElementById("mainFuncion").cloneNode();
    botonNuevo.agregarFuncion = botonAgregarFuncion;
    botonNuevo.val = Number(funcionActual);
    botonNuevo.textContent = "FuncionNueva";
    document.getElementById("verFunciones").appendChild(botonNuevo);
    abrirFuncionBotones.push(botonNuevo);

    botonNuevo.addEventListener('dblclick', (evento) =>{
        botonNuevo.contentEditable = 'true';
        botonNuevo.focus();
    });

    botonNuevo.addEventListener('click', (evento) =>{
        actualizarEspecifica(Number(funcionActual));
        funcionActual = botonNuevo.val;
        necesitaDibujar = true;
    });

    botonNuevo.addEventListener('contextmenu', (evento) => {
        evento.preventDefault(); // Esto evita que salga el menú clásico del navegador
        eliminarFuncion(botonNuevo.val);
    });

    botonNuevo.addEventListener('blur', (evento) => {
        botonNuevo.contentEditable = 'false';
        nombresFunciones[botonNuevo.val-1] = botonNuevo.textContent.trim();
        botonAgregarFuncion.textContent = botonNuevo.textContent.trim();
    });

    botonNuevo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            evento.currentTarget.blur();
        }
    });
    
    botonAgregarFuncion.className = "img fondoOscuro";
    botonAgregarFuncion.textContent = "nuevaFuncion";
    botonAgregarFuncion.val = botonNuevo.val;
    abrirFuncionBotones.push(botonAgregarFuncion);
    document.getElementById("menuObjetosFunciones").appendChild(botonAgregarFuncion);
    botonAgregarFuncion.addEventListener('click', (evento) => {
        if (botonNuevo.val == funcionActual){
            alert("No puedes poner la misma función dentro de si misma.");
        }else{
            let encontrado = false;
            for (let i in funcionesBotones){
                if (funcionesBotones[i].funcion == botonNuevo.val && funcionesBotones[i].funcionUsada == funcionActual){
                    encontrado = true;
                    alert("No puedes utilizar esta función aqui porque crearías un bucle.")
                }
            }
            if (!encontrado){
                new FuncionUtilizable(centroPantalla().mas(new Vector2(-100,0)), funcionActual, botonNuevo.val);
            }
            
        }
    });
    actualizarEspecifica(Number(funcionActual));
});

let btnMainFuncion = document.getElementById("mainFuncion");
btnMainFuncion.addEventListener('click', (evento) =>{
    actualizarEspecifica(Number(funcionActual));
    funcionActual = 0;
    necesitaDibujar = true;
});

// PRESETS
const presetsButton = document.getElementById("presetsButton");
const presets = document.getElementById("presets");

presetsButton.addEventListener("click", () => {
    presets.classList.toggle("open");
});
document.getElementById("presetCompuertas").addEventListener("click", async () => {
    let arch = await cargar_ruta("./presets/CompuertasLogicas.icircuit");
    cargarProyecto(arch);
});
document.getElementById("presetContador").addEventListener("click", async () => {
    let arch = await cargar_ruta("./presets/Contador4Bits.icircuit");
    alert("Presiona el botón rojo de la derecha para iniciar o detener el contador.");
    cargarProyecto(arch);
});
document.getElementById("presetSemaforo").addEventListener("click", async () => {
    let arch = await cargar_ruta("./presets/Semaforo.icircuit");
    alert("Junta el not con su cable para iniciar el semaforo y toma el cable negro y desconectalo para apagarlo.");
    cargarProyecto(arch);
});
document.getElementById("presetALU").addEventListener("click", async () => {
    let arch = await cargar_ruta("./presets/ALU4Bits.icircuit");
    cargarProyecto(arch);
});
document.getElementById("presetCPU4BitsSinRam").addEventListener("click", async () => {
    let arch = await cargar_ruta("./presets/CPU4BitsSinRam.icircuit");
    alert("Junta el not con su cable para iniciar el semaforo y toma el cable negro y desconectalo para apagarlo.");
    alert("En la ROM puedes programar instrucciones: 0010 Registro + Operador, 0011 Registro - Operador, 0100 Registro And Operador, 0101 Registro Or Operador, 0110 JUMP operador al program counter, 1111 detener CPU, todos los demás vacíos.");
    cargarProyecto(arch);
});

// Dibujar Frames
let ultimoTiempo = new Date().getTime();
let contadorTiempo = 0;
let contadorFPS = 0;

let mouseNoScroll = new RectDetecter(new Vector2(20, (canvas.height/100)*67+80), new Vector2((canvas.width/100)*8+100), (canvas.height/100)*55+10);

async function ciclo() {
    let actualTiempo = new Date().getTime();
    let tiempoDelta = (actualTiempo - ultimoTiempo)/1000.0;
    fps = Math.round(1.0/tiempoDelta);
    contadorTiempo += tiempoDelta;
    contadorFPS++;
    eventDiferencia = posicionMouseAnteriorFrame.menos(posicionMouse).producto(1.0/cam.zoom);
    if (eventDiferencia.x != 0 || eventDiferencia.y != 0){
        if (mouseRueda){
            cam.posicion = cam.posicion.mas(eventDiferencia)
            necesitaDibujar = true;
        }
        if (!mouseRueda && mouseLClick && bloqueSeleccionado != undefined){
            bloqueSeleccionado.mover(eventDiferencia);
            desconectarConexiones(bloqueSeleccionado);
            necesitaDibujar = true;
        }
    }

    if (!verCorriente){
        corrientesDibujables[funcionActual] = [];
    }
    if (corrientesDibujables[funcionActual] && corrientesDibujables[funcionActual].length > 0){
        necesitaDibujar = true;
    }
    
    //console.log(fps)
    if (necesitaSeñalElectrica){
        necesitaSeñalElectrica = false;
        for (let i = 0; i < fuentesActivas.length; i++){
            señalElectrica(fuentesActivas[i], false, false, ejecsmax);
            if (fuentesActivas[i] == undefined){
                return;
            }
            if (fuentesActivas[i].estado[0] == 0){
                fuentesActivas.splice(i, 1);
                i--;
            }
        }
    }

    if (nodosSeñalElectrica.length > 0){
        for(let i = 0; i < nodosSeñalElectrica.length; i++){
            señalElectrica(nodosSeñalElectrica[i], false, false, ejecsmax);
            nodosSeñalElectrica.splice(i, 1);
            i++;
        }
    }

    if (verCorriente){
        for (let i = 0; i < corrientesDibujables.length; i++){
            for (let j = 0; j < corrientesDibujables[i].length; j++){
                let corriente = corrientesDibujables[i][j];
                if (corriente.nodo != undefined){
                    let distanciaInicial = corriente.nodo.posicion.distancia(corriente.final);
                    corriente.nodo.posicion = corriente.nodo.posicion.mas(corriente.movimiento.producto(tiempoDelta));
                    if (corriente.nodo.padre != undefined && corriente.nodo.padre.estado == 0){
                        corriente.terminar();
                        corrientesDibujables[i].splice(j, 1);
                        j--;
                    }else if(corriente.nodo.posicion.distancia(corriente.final) >= distanciaInicial || isNaN(corriente.nodo.posicion.distancia(corriente.final))){
                        corriente.terminar();
                        corrientesDibujables[i].splice(j, 1);
                        j--;
                    }
                }
            }
        }
    }

    if (necesitaDibujar){
        actualizarNodos();
        necesitaDibujar = false;
    }
    


    if (verCorriente){
        if (contadorTiempo >= frecuenciaFlujo){
            contadorTiempo = 0;
            for (let e in nodos[0]){
                nodos[0][e].transformarCorriente();
            }
        }
    }

    posicionMouseAnteriorFrame.x = posicionMouse.x;
    posicionMouseAnteriorFrame.y = posicionMouse.y;

    ultimoTiempo = actualTiempo;
    requestAnimationFrame(ciclo);
}

// Test
// for(let i = 0; i < 1000; i++){
// }

// Empezar programa
ciclo();