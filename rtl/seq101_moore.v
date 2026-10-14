`timescale 1ns/1ps
// "101" detector -- Moore FSM, OVERLAP = 1 (overlapping) or 0 (non-overlapping)
module seq101_moore #(parameter OVERLAP = 1) (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0, S1 = 2'd1, S2 = 2'd2, S3 = 2'd3;
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        case (state)
            S0: next_state = serin ? S1 : S0;
            S1: next_state = serin ? S1 : S2;
            S2: next_state = serin ? S3 : S0;
            S3: next_state = serin ? S1 : (OVERLAP ? S2 : S0);   // <-- the difference
            default: next_state = S0;
        endcase
    end

    always @(*) det_out = (state == S3);
endmodule
