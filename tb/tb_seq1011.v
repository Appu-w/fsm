`timescale 1ns/1ps
module tb_seq1011;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_out;
    integer i, hits = 0;

    seq1011_mealy dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb_seq1011.vcd");
        $dumpvars(0, tb_seq1011);
        repeat (2) @(posedge clk);
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;
            @(posedge clk); #1;
        end
        $display("DONE: %0d detections of 1011", hits);
        $finish;
    end

    always @(posedge clk)                    // values just BEFORE the edge
        if (!rst) begin
            $display("%6t  state=S%0d  serin=%b  det_out=%b",
                     $time, dut.state, serin, det_out);
            if (det_out) hits = hits + 1;
        end
endmodule
