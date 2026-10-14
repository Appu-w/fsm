`timescale 1ns/1ps
// Asserts det_out when serin == 2'b01 for 3 consecutive clocks.
// Overlap allowed: a 4th, 5th ... consecutive 01 keeps det_out high.
module det01x3 (
    input  wire       clk,
    input  wire       rst,        // active-high asynchronous reset
    input  wire [1:0] serin,      // 2-bit input every clock
    output reg        det_out
);
    localparam [1:0] S0 = 2'd0,   // 0 consecutive "01"
                     S1 = 2'd1,   // 1 consecutive "01"
                     S2 = 2'd2,   // 2 consecutive "01"
                     S3 = 2'd3;   // >= 3 consecutive  -> det_out = 1

    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst) begin
        if (rst) state <= S0;
        else     state <= next_state;
    end

    always @(*) begin
        next_state = S0;                  // anything except 01 -> back to S0
        if (serin == 2'b01) begin
            case (state)
                S0: next_state = S1;
                S1: next_state = S2;
                S2: next_state = S3;
                S3: next_state = S3;      // OVERLAP: stay, keep detecting
                                          // (non-overlap would be: S1)
                default: next_state = S0;
            endcase
        end
    end

    always @(*) begin
        det_out = (state == S3);
    end
endmodule
