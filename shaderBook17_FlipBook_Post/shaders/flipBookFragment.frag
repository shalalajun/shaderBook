uniform float time;
uniform float tileHorize;
uniform float tileVertical;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
  
  
  float totalTiles = tileHorize * tileVertical;
  float tileIndex = mod(floor(time * 10.0), totalTiles); // 10.0 is speed of animation

  float col = mod(tileIndex, tileHorize);
  float row = floor(tileIndex / tileHorize);

  vec2 tileUV = vec2(col / tileHorize, 1.0 - row / tileVertical);

  // Adjust the UV coordinate to match the current tile.
  vUv = vUv / tileUV;

  vec4 texCol =  texture2D(uMap, vUv);

  gl_FragColor = texCol;
}