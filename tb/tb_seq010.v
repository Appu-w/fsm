`timescale 1ns/1ps
module tb_seq010;
    reg  clk = 1'b0, rst = 1'b1, serin = 1'b0;
    wire det_out;
    integer i, hits = 0, errors = 0;
    reg [1:0] hist;  integer n;  reg exp;     // golden model (slice 4)

    seq010_moore dut (.clk(clk), .rst(rst), .serin(serin), .det_out(det_out));

    always #5 clk = ~clk;                     // 10 ns clock period

    initial begin
        $dumpfile("tb_seq010.vcd");           // open in GTKWave
        $dumpvars(0, tb_seq010);
        repeat (2) @(posedge clk);            // hold reset for 2 clocks
        #1 rst = 1'b0;
        for (i = 0; i < 100; i = i + 1) begin
            serin = $random;                  // LSB of a random number: 0/1
            @(posedge clk); #1;               // held for exactly one clock
        end
        $display("DONE: %0d detections, %0d errors", hits, errors);
        $finish;
    end

    always @(posedge clk)
        if (!rst)
            $strobe("%6t  serin=%b  ->  state=S%0d  det_out=%b",
                    $time, serin, dut.state, det_out);

    always @(posedge clk or posedge rst)
        if (rst) begin
            hist <= 2'b00;  n <= 0;  exp <= 1'b0;
        end else begin
            hist <= {hist[0], serin};
            if (n >= 2 && {hist, serin} == 3'b010) begin
                exp <= 1'b1;  n <= 0;                 // hit: restart counting
            end else begin
                exp <= 1'b0;  n <= (n < 2) ? n + 1 : n;
            end
        end

    always @(negedge clk)                     // compare mid-cycle
        if (!rst) begin
            if (det_out) hits = hits + 1;
            if (det_out !== exp) begin
                errors = errors + 1;
                $display("MISMATCH at %0t: det_out=%b expected=%b",
                         $time, det_out, exp);
            end
        end
endmodule
