`timescale 1ns/1ps
// Non-overlapping "010" sequence detector -- Mealy FSM
module seq010_mealy (
    input  wire clk,
    input  wire rst,
    input  wire serin,
    output reg  det_out
);
    localparam [1:0] S0 = 2'd0,    // idle
                     S1 = 2'd1,    // got "0"
                     S2 = 2'd2;    // got "01"
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= S0;
        else     state <= next_state;

    // next state AND output in one combinational block
    always @(*) begin
        next_state = S0;
        det_out    = 1'b0;
        case (state)
            S0: next_state = serin ? S0 : S1;
            S1: next_state = serin ? S2 : S1;
            S2: begin
                    next_state = S0;        // 011 -> idle, 010 -> idle (non-overlap)
                    det_out    = ~serin;    // "01" followed by 0: detected NOW
                end
            default: next_state = S0;
        endcase
    end
endmodule
