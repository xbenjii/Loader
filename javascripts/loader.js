/*Start Canvas*/
var Canvas = function(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.segments = {};
    this.outerSegments = {};
    this.percentage = 0;
    this.lastPercentage = 0;
};

Canvas.prototype.render = function() {
    var self = this;
    this.clear();
    this.arcFrame({
        start: 0,
        stop: 360,
        fillStyle: 'white',
        radius: 105,
        frameWidth: 15,
        frameStart: 0,
        frameStop: 360
    });
    this.circle({
        fill: true,
        fillStyle: 'white',
        stroke: true,
        strokeStyle: 'lightgrey',
        radius: 20
    });
    this.circle({
        fill: true,
        fillStyle: this.circleGradient({
            radiusStart: 60,
            radiusFinish: 1,
            colourStart: 'white',
            colourFinish: 'rgba(255,255,255,0)'
        }),
        radius: 60
    });
    var which = (typeof this.segments[this.percentage] !== "undefined" && this.segments[this.percentage].options.finished === true) ? this.percentage : this.lastPercentage;
    this.renderPercentage(which, {
        fillStyle: 'green',
        font: '16pt Arial',
        textAlign: 'center',
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + 8
    });
    for (var percentage in this.segments) {
        var segment = this.segments[percentage];

        if (segment.options.distanceFromCenter < 15) {
            segment.update('distanceFromCenter', segment.options.distanceFromCenter + 0.3);
        }
        if (segment.options.broke === true) {
            if (segment.options.height < 105) {
                segment.update('height', segment.options.height + 3);
            } else if (segment.options.height >= 105) {
                segment.update('height', 105);
                segment.update('finished', true);
                this.outerSegments[percentage].update('started', true);
            } else {
                segment.update('distanceFromCenter', segment.options.distanceFromCenter - 0.1);
            }
        }
        this.renderSegment(segment);
    }
    if (typeof this.segments[100] !== "undefined") {
        if (this.segments[100].options.distanceFromCenter >= 15) {
            this.segments[100].update('broke', true);
        }
    }
    for (var percentage in this.outerSegments) {
        var segment = this.outerSegments[percentage];
        if (segment.options.started === true) {
            if (segment.options.outerAnimThickness >= 0) {
                segment.update('outerAnimThickness', segment.options.outerAnimThickness - 0.2);
            } else {
                segment.update('outerAnimDistance', 200);
                segment.update('finished', true);
            }
            if (segment.options.outerAnimDistance < 40) {
                segment.update('outerAnimDistance', segment.options.outerAnimDistance + 0.5)
            }
            this.renderOuterAnim(segment);
        }
    }
    requestAnimationFrame(function() {
        self.render();
    });
};

Canvas.prototype.circle = function(options) {
    options.start = 0;
    options.stop = 360;
    this.arc(options);
};

Canvas.prototype.arcFrame = function(options) {
    this.ctx.beginPath();
    this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        options.radius,
        Helper.toRadians(options.start),
        Helper.toRadians(options.stop),
        false
    );
    if (options.fillStyle) {
        this.ctx.fillStyle = options.fillStyle;
    }
    this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        options.radius + options.frameWidth,
        Helper.toRadians(options.frameStart),
        Helper.toRadians(options.frameStop),
        true
    );
    this.ctx.fill();
};

Canvas.prototype.arc = function(options) {
    this.ctx.beginPath();
    if (options.lineWidth) {
        this.ctx.lineWidth = options.lineWidth;
    }
    this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        options.radius,
        Helper.toRadians(options.start),
        Helper.toRadians(options.stop),
        options.antiClockwise || false
    );
    if (options.stroke) {
        this.ctx.strokeStyle = options.strokeStyle || 'white';
        this.ctx.stroke();
    }
    if (options.fillStyle) {
        this.ctx.fillStyle = options.fillStyle;
    }
    if (options.fill) {
        this.ctx.fill();
    }
};

Canvas.prototype.renderSegment = function(segment) {
    this.arcFrame({
        start: Math.floor(segment.lastPercentage * 3.6),
        stop: Math.ceil(segment.percentage * 3.6),
        fillStyle: 'green',
        radius: segment.options.height,
        frameWidth: segment.options.distanceFromCenter,
        frameStart: Math.ceil(segment.percentage * 3.6),
        frameStop: Math.floor(segment.lastPercentage * 3.6)
    });
};

Canvas.prototype.renderOuterAnim = function(segment) {
    this.arcFrame({
        start: Math.floor(segment.lastPercentage * 3.6),
        stop: Math.ceil(segment.percentage * 3.6),
        fillStyle: 'green',
        radius: 105 + segment.options.outerAnimDistance,
        frameWidth: segment.options.outerAnimThickness,
        frameStart: Math.ceil(segment.percentage * 3.6),
        frameStop: Math.floor(segment.lastPercentage * 3.6)
    });
};

Canvas.prototype.renderPercentage = function(percentage, options) {
    this.ctx.fillStyle = options.fillStyle;
    this.ctx.font = options.font;
    this.ctx.textAlign = options.textAlign;
    this.ctx.fillText(percentage, options.x, options.y);
};

Canvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.circleGradient = function(options) {
    var gradient = this.ctx.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height / 2,
        options.radiusStart,
        this.canvas.width / 2,
        this.canvas.height / 2,
        options.radiusFinish
    );
    gradient.addColorStop(0, options.colourFinish);
    gradient.addColorStop(1, options.colourStart);
    return gradient;
};

/*Finish Canvas*/

/*Start Segment*/
var Segment = function(percentage, lastPercentage, options) {
    this.percentage = percentage;
    this.lastPercentage = lastPercentage;
    this.options = options || {
        height: 20,
        distanceFromCenter: 0,
        broke: false,
        finished: false
    };
    return this;
};

Segment.prototype.update = function(key, value) {
    if (typeof this.options[key] !== "undefined") {
        this.options[key] = value;
    }
};

var OuterSegment = function(percentage, lastPercentage, options) {
    this.percentage = percentage;
    this.lastPercentage = lastPercentage;
    this.options = options || {
        started: false,
        outerAnimThickness: 5,
        outerAnimDistance: 15,
        colour: 'green'
    }
    return this;
}

OuterSegment.prototype.update = function(key, value) {
    if (typeof this.options[key] !== "undefined") {
        this.options[key] = value;
    }
}
/*Finish Segment*/

/*Start Loader*/
var Loader = function(options) {
    this.options = options || {
        loader: 'loader',
        colour: 'green'
    };
    this.start();
};

Loader.prototype.setPercentage = function(percentage) {
    if (typeof percentage === "undefined") {
        return percentage;
    } else {
        if (percentage > 100) {
            this.reset();
            return false;
        }
        this.lastPercentage = this.percentage;
        this.percentage = percentage;
        this.canvas.percentage = this.percentage;
        this.canvas.lastPercentage = this.lastPercentage;
        this.canvas.segments[percentage] = new Segment(percentage, this.lastPercentage);
        if (percentage === 100 && typeof this.canvas.segments[100] !== "undefined") {
            this.canvas.outerSegments[100] = new OuterSegment(100, 0);
        } else {
            this.canvas.outerSegments[percentage] = new OuterSegment(percentage, this.lastPercentage);
        }
        if (typeof this.canvas.segments[this.lastPercentage] !== "undefined") {
            this.canvas.segments[this.lastPercentage].update('broke', true);
        }
    }
};

Loader.prototype.addPercentage = function(percentage) {
    percentage = this.percentage + percentage > 100 ? 100 : this.percentage + percentage;
    this.setPercentage(percentage);
};

Loader.prototype.start = function(remove) {
    if (typeof remove !== "undefined") {
        document.getElementById('canvas').parentNode.removeChild(document.getElementById('canvas'));
    }
    var canvas = document.createElement('canvas');
    canvas.setAttribute('height', 300);
    canvas.setAttribute('width', 300);
    canvas.setAttribute('id', 'canvas');
    this.options.loader.appendChild(canvas);
    this.canvas = new Canvas(document.getElementById('canvas'));
    this.canvas.render();
    this.percentage = 0;
};

Loader.prototype.reset = function() {
    for (var key in this.canvas.segments) {
        delete this.canvas.segments[key];
    }
    this.canvas.segments = {};
    for (var key in this.canvas.outerSegments) {
        delete this.canvas.outerSegments[key];
    }
    this.canvas.outerSegments = {};
    this.canvas.percentage = 0;
    this.canvas.lastPercentage = 0;
    this.percentage = 0;
    this.lastPercentage = false;
}
/*Finish Loader*/

/*Start Helper*/
var Helper = {
    toRadians: function(degrees) {
        return degrees * Math.PI / 180;
    }
};
/*Finish Helper*/
