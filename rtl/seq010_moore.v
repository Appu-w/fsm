`timescale 1ns/1ps
// Non-overlapping "010" sequence detector -- Moore FSM
module seq010_moore (
    input  wire clk,
    input  wire rst,       // active-high asynchronous reset
    input  wire serin,     // serial input, one bit per clock
    output reg  det_out    // high for one clock after "010" is seen
);
    localparam [1:0] S0 = 2'b00,   // idle (nothing useful yet)
                     S1 = 2'b01,   // got "0"
                     S2 = 2'b10,   // got "01"
                     S3 = 2'b11;   // got "010"  -> det_out = 1

    reg [1:0] state, next_state;

    // (1) state register
    always @(posedge clk or posedge rst) begin
        if (rst) state <= S0;
        else     state <= next_state;
    end

    // (2) next-state logic
    always @(*) begin
        next_state = S0;                          // default: no latch
        case (state)
            S0: next_state = (serin == 1'b0) ? S1 : S0;
            S1: next_state = (serin == 1'b1) ? S2 : S1;
            S2: next_state = (serin == 1'b0) ? S3 : S0;
            // NON-overlap: the "0" that completed 010 is NOT reused.
            // A new 0 starts a fresh sequence, a 1 goes back to idle.
            S3: next_state = (serin == 1'b0) ? S1 : S0;
            default: next_state = S0;
        endcase
    end

    // (3) output logic
    always @(*) begin
        det_out = (state == S3);
    end
endmodule
