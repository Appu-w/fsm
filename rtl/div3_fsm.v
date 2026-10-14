`timescale 1ns/1ps
// div3 = 1 when the binary number received so far (MSB first) is divisible by 3
module div3_fsm (
    input  wire clk,
    input  wire rst,
    input  wire bin,       // serial bit, MSB first
    output reg  div3
);
    localparam [1:0] R0 = 2'd0, R1 = 2'd1, R2 = 2'd2;   // remainder 0/1/2
    reg [1:0] state, next_state;

    always @(posedge clk or posedge rst)
        if (rst) state <= R0;
        else     state <= next_state;

    always @(*) begin
        case (state)                     // next = (2*r + bin) mod 3
            R0:      next_state = bin ? R1 : R0;
            R1:      next_state = bin ? R0 : R2;
            R2:      next_state = bin ? R2 : R1;
            default: next_state = R0;
        endcase
    end

    always @(*) div3 = (state == R0);
endmodule
