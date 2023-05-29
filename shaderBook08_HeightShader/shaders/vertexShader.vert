#include <common>
#include <shadowmap_pars_vertex>

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

void main() {

  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>

  #include <begin_vertex>

  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 clipPosition = projectionMatrix * viewPosition;
  
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-viewPosition.xyz);
  vPosition =position.xyz; //월드 좌표를 사용하려면 modelPosition.xyz를 사용하면 된다.

  gl_Position = clipPosition;
}

// // = object.matrixWorld
// uniform mat4 modelMatrix;

// // = camera.matrixWorldInverse * object.matrixWorld
// uniform mat4 modelViewMatrix;

// // = camera.projectionMatrix
// uniform mat4 projectionMatrix;

// // = camera.matrixWorldInverse
// uniform mat4 viewMatrix;

// // = inverse transpose of modelViewMatrix
// uniform mat3 normalMatrix;

// // = camera position in world space
// uniform vec3 cameraPosition;