class PID {
    constructor(p_, i_, d_) {
        // this.p = 0.2;
        // this.i = 0.01;
        // this.d = 0.03;

        this.p = p_;
        this.i = i_;
        this.d = d_;

        this.error_now = 0;
        this.error_before = 0;
        this.error_acc = 0;

        this.target = 0;
        this.curr_condition = 0;
    }

    setTarget(target_){
        this.target = target_;
        this.error_now = this.target - this.curr_condition;
        console.log(this.error_now)
        return this.getOutput();
    }

    getOutput(){
        this.curr_condition = (this.p * this.error_now + this.i * (this.error_acc) + this.d * (this.error_now - this.error_before))
        this.error_acc += this.error_now;
        this.error_before = this.error_now;
        return this.curr_condition;
    }

    getCurrentCond(){
        return this.curr_condition;
    }
}

export { PID };