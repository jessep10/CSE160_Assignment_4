class Cube {
  constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.textureNumber = -1; 
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.shiny = 0;  
  }
  render() {
    var rgba = this.color;


    
    gl.uniform1i(u_whichTexture, this.textureNumber);
    gl.uniform1i(u_shiny, this.shiny);
    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //Front face

    drawTriangle3DUVNormal([0,0,0, 1,0,0, 1,1,0], [0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal([0,0,0, 1,1,0, 0,1,0], [0,0, 1,1, 0,1], [0,0,1, 0,0,1, 0,0,1]);

    //Top face

    drawTriangle3DUVNormal([0,1,0, 1,1,0, 1,1,1], [0,0, 1,0, 1,1], [0,1,0, 0,1,0, 0,1,0]);    // First triangle
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 0,1,1], [0,0, 1,1, 0,1], [0,1,0, 0,1,0, 0,1,0]);    // Second triangle

    //Back face
    drawTriangle3DUVNormal([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1], [0,0,1, 0,0,1, 0,0,1]); 
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);

    //Bottom face

    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1], [0,-1, 0,   0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0], [0,-1, 0,   0,-1,0, 0,-1,0]);

    //Right face

    drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

    //Left face

    drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);
  }

   

  renderfast(){
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNumber);

    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


    var allverts = [];
    var uv = [];
    // Front face
    allverts = allverts.concat([0,0,0, 1,0,0, 1,1,0]);
    uv = uv.concat([0,0, 1,0, 1,1]);      
    allverts = allverts.concat([0,0,0, 1,1,0, 0,1,0]);
    uv = uv.concat([0,0, 1,1, 0,1]);       

    // Top face
    allverts = allverts.concat([0,1,0, 1,1,0, 1,1,1]);
    uv = uv.concat([0,0, 1,0, 1,1]);       
    allverts = allverts.concat([0,1,0, 1,1,1, 0,1,1]);
    uv = uv.concat([0,0, 1,1, 0,1]);    
    // Right face
    allverts = allverts.concat([1,0,0, 1,1,0, 1,1,1]);
    uv = uv.concat([0,0, 0,1, 1,1]);     
    allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);
    uv = uv.concat([0,0, 1,1, 1,0]);    

    // Left face
    allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1]);
    uv = uv.concat([1,0, 1,1, 0,1]);      
    allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);
    uv = uv.concat([1,0, 0,1, 0,0]);       

    // Bottom face
    allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
    uv = uv.concat([0,1, 1,1, 1,0]);     
    allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);
    uv = uv.concat([0,1, 1,0, 0,0]);   

    // Back face
    allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
    uv = uv.concat([1,0, 0,1, 0,0]);     
    allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
    uv = uv.concat([1,0, 1,1, 0,1])

    drawTriangle3DUV(allverts, uv);

  } 
}