`timescale 1ns/1ps
// det_out = 1 when serin == 2'b11 on 2 consecutive clocks, NON-overlapping
module det11x2 (
    input  wire       clk,
    input  wire       rst,
    input  wire [1:0] serin,
    output reg        det_out
);
    localparam [1:0] S0 = 2'd0,   // 0 in a row
                     S1 = 2'd1,   // 1 in a row
                     S2 = 2'd2;   // 2 in a row -> det_out = 1
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        if (serin == 2'b11)
            case (state)
                S0:      next_state = S1;
                S1:      next_state = S2;
                S2:      next_state = S1;   // non-overlap: count restarts at 1
                default: next_state = S0;   // (overlap would be: S2)
            endcase
    end

    always @(*) det_out = (state == S2);
endmodule
