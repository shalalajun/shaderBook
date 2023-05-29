#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

uniform vec3 bottomColor;
uniform vec3 topColor;
uniform float minHeight;
uniform float maxHeight;
varying vec3 vPosition;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

  float yNormalized = (vPosition.z - minHeight) / (maxHeight - minHeight);
  vec3 heightColor = mix(bottomColor, topColor, yNormalized);

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );


  float NdotL = dot(vNormal, directionalLights[0].direction);
  float lightIntensity =max((NdotL * shadow),0.0) * 0.5+0.5;
  float toon = ceil(lightIntensity * 2.0) / 2.0;
 // vec3 directionalLight = directionalLights[0].color * (toon + 0.5);
  //vec3 directionalLight = (heightColor + toon)  * 0.5; //플러스 후에 0.5를 곱하면 에버리지값이 된다.
 // vec3 directionalLight = min(vec3(toon), heightColor); // 다큰

  vec3 white = vec3(1.0,1.0,1.0);
  // vec3 directionalLight = white - ((white - vec3(toon))*(white-heightColor));// 스크린
  // directionalLight = directionalLight * heightColor; 

  vec3 lumCoeff = vec3(0.2126, 0.7152, 0.0722);
  float luminance = dot(heightColor, lumCoeff);

  vec3 directionalLight;

  if(luminance < 0.45)
    directionalLight =  2.0 * toon * heightColor;

  else if(luminance > 0.55)
    directionalLight =  white - 2.0 * (white - vec3(toon)) * ( white - heightColor );

  else 
  {
    vec3 result1 = 2.0 * toon * heightColor;
    vec3 result2 = white - 2.0 * (white - vec3(toon)) * ( white - heightColor );
    directionalLight = mix(result1, result2, (luminance - 0.45) * 10.0);
  }
//오버레이이다.

//   vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
//   float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

//   float specularIntensity = pow(NdotH * lightIntensity, 100.0 / uGlossiness);
//  //float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

//   vec3 specular = specularIntensity * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4( (directionalLight + ambientLightColor), 1.0);
}