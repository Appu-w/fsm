`timescale 1ns/1ps
// Overlapping "1011" detector -- Mealy FSM
module seq1011_mealy (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0,   // idle
                     S1 = 2'd1,   // got "1"
                     S2 = 2'd2,   // got "10"
                     S3 = 2'd3;   // got "101"
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    always @(*) begin
        next_state = S0;
        det_out    = 1'b0;
        case (state)
            S0: next_state = serin ? S1 : S0;
            S1: next_state = serin ? S1 : S2;   // "11" -> still "1"
            S2: next_state = serin ? S3 : S0;   // "100" -> nothing
            S3: if (serin) begin                // "1011" found!
                    next_state = S1;            // overlap: keep last "1"
                    det_out    = 1'b1;
                end else
                    next_state = S2;            // "1010" -> keep "10"
            default: next_state = S0;
        endcase
    end
endmodule
