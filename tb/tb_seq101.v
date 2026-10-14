`timescale 1ns/1ps
module tb_seq101;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_ov, det_nov;
    integer i;

    seq101_moore #(.OVERLAP(1)) u_ov  (.clk(clk), .rst(rst), .serin(serin), .det_out(det_ov));
    seq101_moore #(.OVERLAP(0)) u_nov (.clk(clk), .rst(rst), .serin(serin), .det_out(det_nov));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb_seq101.vcd");
        $dumpvars(0, tb_seq101);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;
            @(posedge clk); #1;
        end
        $finish;
    end

    always @(posedge clk)
        if (!rst)
            $strobe("%6t serin=%b | overlap: S%0d det=%b | non-overlap: S%0d det=%b",
                    $time, serin, u_ov.state, det_ov, u_nov.state, det_nov);
endmodule
