`timescale 1ns/1ps
module tb_det01x3;
    reg        clk = 1'b0, rst = 1'b1;
    reg  [1:0] serin = 2'b00;
    wire       det_out;
    integer    i, hits = 0, errors = 0, run;
    reg        exp;

    det01x3 dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb_det01x3.vcd");
        $dumpvars(0, tb_det01x3);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;                              // 00/01/10/11
            // serin = ({$random} % 3 != 0) ? 2'b01 : $random;  // more hits
            @(posedge clk); #1;
        end
        $display("DONE: %0d clocks with det_out=1, %0d errors", hits, errors);
        $finish;
    end

    always @(posedge clk)
        if (!rst)
            $strobe("%6t  serin=%b  ->  state=S%0d  det_out=%b",
                    $time, serin, dut.state, det_out);

    always @(posedge clk or posedge rst)
        if (rst)                  begin run <= 0; exp <= 1'b0; end
        else if (serin == 2'b01)  begin run <= (run < 3) ? run + 1 : run;
                                        exp <= (run >= 2);              end
        else                      begin run <= 0; exp <= 1'b0; end

    always @(negedge clk)
        if (!rst) begin
            if (det_out) hits = hits + 1;
            if (det_out !== exp) begin
                errors = errors + 1;
                $display("MISMATCH at %0t", $time);
            end
        end
endmodule
