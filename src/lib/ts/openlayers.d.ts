declare var ol:ol.Static;

declare module ol {

    interface Static {

        has: {
            DEVICE_PIXEL_RATIO:number;
        }

        events:events.Static;
        geom:geometry.Static;
        interaction:interaction.Static;
        render:render.Static;
        style:style.Static;

        Feature:Feature;
        FeatureOverlay:FeatureOverlay;

    }

    interface Coordinate extends Array<number> {
    }

    interface Feature {
        new (config:any):Feature;
    }

    interface FeatureOverlay {
        new (config:any):FeatureOverlay;

        setMap(map:any):void;
        setStyle(style:style.Style):void;

    }

    interface Map extends Observable {
        new (config:any):Map;

        addInteraction(interaction:interaction.Interaction):void;
        getPixelFromCoordinate(coordinate:Coordinate):Pixel;
        getSize():Size;
        render():void;
        removeInteraction(interaction:interaction.Interaction):void;
    }

    interface Observable {

        on(type:string, listener:Function, scope?:any):void;
        once(type:string, listener:Function, scope?:any):void;
        un(type:string, listener:Function, scope?:any):void;

    }

    interface Pixel extends Array<number> {
    }

    interface Size extends Array<number> {
    }

    module events {

        interface Static {

        }

    }

    module geometry {

        interface Static {

            Polygon:Polygon;

        }

        interface Geometry {

        }

        interface SimpleGeometry extends Geometry {

        }

        interface Polygon extends SimpleGeometry {
            new (config:any):Polygon;

            getCoordinates():Coordinate[][];
        }

    }

    module interaction {

        interface Static {

            DragBox:DragBox;

        }

        interface DragBox extends Interaction {
            new (config:any):DragBox;

            getGeometry():geometry.Polygon;
        }

        interface Interaction extends Observable {

        }

        interface Pointer extends Interaction {

        }

    }

    module render {

        interface Static {

            Event:Event;

        }

        interface Event {

            context:CanvasRenderingContext2D;

        }

    }

    module style {

        interface Static {

            Circle:Circle;
            Fill:Fill;
            Stroke:Stroke;
            Style:Style;

        }

        interface Circle {
            new (config:any):Circle;
        }

        interface Fill {
            new (config:any):Fill;
        }

        interface Stroke {
            new (config:any):Stroke;
        }

        interface Style {
            new (config:any):Style;
        }

    }

}
